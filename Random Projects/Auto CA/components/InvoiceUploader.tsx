import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2, Play, Plus, CloudUpload, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { extractInvoiceData, generateJournalEntryData } from '../services/geminiService';
import { Invoice, JournalEntry, ExpenseCategory } from '../types';
import { generateId } from '../services/utils';

interface InvoiceUploaderProps {
  onInvoiceProcessed: (invoice: Invoice, journal: JournalEntry) => void;
}

interface FileItem {
  id: string;
  file: File;
  status: 'idle' | 'queued' | 'rechecking' | 'processing' | 'success' | 'error';
  error?: string;
  startTime?: number;        // When the *current* attempt started
  lastProcessedAt?: number;  // When the *last* attempt finished (success or fail)
  retryCount: number;
  isRecovered?: boolean;     // True if success after failure/recheck
}

// REDUCED CONCURRENCY to avoid 429 Rate Limits
const MAX_CONCURRENCY = 2; 
// INCREASED TIMEOUT to allow for exponential backoff retries (e.g. 2s + 4s + 8s waiting)
const JOB_TIMEOUT_MS = 60000; // 60 seconds
const STUCK_THRESHOLD_MS = 65000; // Slightly higher than timeout

export const InvoiceUploader: React.FC<InvoiceUploaderProps> = ({ onInvoiceProcessed }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileQueue, setFileQueue] = useState<FileItem[]>([]);
  const [recheckSessionId, setRecheckSessionId] = useState<string | null>(null);

  // Computed progress
  const processedCount = fileQueue.filter(f => f.status === 'success' || f.status === 'error').length;
  const totalCount = fileQueue.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((processedCount / totalCount) * 100);
  const isProcessing = fileQueue.some(f => f.status === 'processing' || f.status === 'queued' || f.status === 'rechecking');

  // --- QUEUE MANAGEMENT ---

  // 1. Queue Monitor: Automatically starts jobs if slots are available
  useEffect(() => {
    const activeJobs = fileQueue.filter(f => f.status === 'processing').length;
    // We treat 'rechecking' items with higher priority or same as 'queued'
    const waitingJobs = fileQueue.filter(f => f.status === 'queued' || f.status === 'rechecking');

    if (activeJobs < MAX_CONCURRENCY && waitingJobs.length > 0) {
      // Get the next candidates to fill the slots
      const slotsAvailable = MAX_CONCURRENCY - activeJobs;
      const nextBatch = waitingJobs.slice(0, slotsAvailable);

      nextBatch.forEach(job => {
        processInvoiceJob(job);
      });
    }

    // 2. Batch Summary Monitor
    if (recheckSessionId) {
       const isBatchComplete = !fileQueue.some(f => 
          f.status === 'processing' || f.status === 'queued' || f.status === 'rechecking'
       );
       
       if (isBatchComplete) {
          const summary = {
             totalInvoices: fileQueue.length,
             completed: fileQueue.filter(f => f.status === 'success').length,
             recovered: fileQueue.filter(f => f.status === 'success' && f.isRecovered).length,
             failed: fileQueue.filter(f => f.status === 'error').length,
             stillFailed: fileQueue.filter(f => f.status === 'error' && f.retryCount > 0).length,
             skipped: 0 // Implicitly those that were already success before recheck
          };
          console.log("Batch Re-Check Finished:", summary);
          // Reset session so we don't log repeatedly
          setRecheckSessionId(null);
       }
    }

  }, [fileQueue, recheckSessionId]);

  // 3. Start Function: Mark idle files as 'queued'
  const startInvoiceProcessingQueue = () => {
    console.log("Starting Invoice Processing Queue...");
    setFileQueue(prev => prev.map(f => 
      f.status === 'idle' ? { ...f, status: 'queued' } : f
    ));
  };

  // 4. Batch Re-Check & Recovery
  const recheckAllInvoices = async () => {
     console.log("Initiating Batch Re-Check & Recovery...");
     const now = Date.now();
     
     setFileQueue(prev => prev.map(f => {
       // Identify stuck: Processing state but started > threshold
       const isStuck = (f.status === 'processing' || f.status === 'rechecking') && f.startTime && (now - f.startTime > STUCK_THRESHOLD_MS);
       // Identify other candidates
       const isFailed = f.status === 'error';
       const isIdle = f.status === 'idle';
       const isQueued = f.status === 'queued'; // Include queued to ensure nothing is left behind
       
       // Skip if already success (unless we wanted to force re-process, but per requirements we skip COMPLETE)
       if (f.status === 'success') return f;

       if (isStuck || isFailed || isIdle || isQueued) {
         return {
           ...f,
           status: 'rechecking',
           error: undefined,
           startTime: undefined, // Will be set when job actually picks up
           // Don't reset retryCount entirely if you want to limit total lifetime retries, 
           // but for a manual re-check, giving a fresh start (0) is usually expected behavior.
           // However, let's keep it 0 to give it a fair chance.
           retryCount: 0 
         };
       }
       
       return f;
     }));
     
     setRecheckSessionId(generateId());
  };

  // 5. The Worker: Processes a single invoice independently
  const processInvoiceJob = async (item: FileItem) => {
    console.log(`[Job ${item.id}] Starting processing for ${item.file.name} (Attempt ${item.retryCount + 1})`);
    
    // Mark as processing immediately
    setFileQueue(prev => prev.map(f => f.id === item.id ? { ...f, status: 'processing', startTime: Date.now() } : f));

    try {
      // A. Read File
      const { base64, mimeType } = await readFileAsBase64(item.file);

      // B. AI Extraction with Timeout
      // Increased timeout allows for Gemini rate-limit retries to happen internally
      const extractionPromise = extractInvoiceData(base64, mimeType);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout after ${JOB_TIMEOUT_MS/1000}s`)), JOB_TIMEOUT_MS)
      );

      // C. Await Data
      const data = await Promise.race([extractionPromise, timeoutPromise]);
      console.log(`[Job ${item.id}] Extraction complete`, data);

      // D. Create Invoice Object
      const newInvoice: Invoice = {
        id: generateId(),
        filename: item.file.name,
        vendorName: data.vendorName || "Unknown Vendor",
        invoiceDate: data.invoiceDate || new Date().toISOString().split('T')[0],
        totalAmount: data.totalAmount || 0,
        taxAmount: data.taxAmount || 0,
        currency: data.currency || "USD",
        description: data.description || "No description",
        category: (data.category as ExpenseCategory) || ExpenseCategory.Uncategorized,
        confidence: data.confidence || 0,
        status: 'extracted',
        imageUrl: `data:${mimeType};base64,${base64}`
      };

      // E. Generate Journal
      const journalData = await generateJournalEntryData(newInvoice);
      const newJournal: JournalEntry = {
        id: generateId(),
        invoiceId: newInvoice.id,
        date: newInvoice.invoiceDate,
        description: `Inv #${newInvoice.id} - ${newInvoice.vendorName}`,
        debits: journalData.debits || [],
        credits: journalData.credits || []
      };

      // F. Update App State (Success)
      onInvoiceProcessed(newInvoice, newJournal);

      setFileQueue(prev => prev.map(f => f.id === item.id ? { 
        ...f, 
        status: 'success', 
        lastProcessedAt: Date.now(),
        isRecovered: f.status === 'rechecking' || f.retryCount > 0 
      } : f));

      console.log(`[Job ${item.id}] Success`);

    } catch (err: any) {
      console.error(`[Job ${item.id}] Failed:`, err);
      
      // G. Error Handling & Retry Logic
      setFileQueue(prev => {
        const currentItem = prev.find(i => i.id === item.id);
        if (!currentItem) return prev;

        // If we haven't maxed out retries (max 2 retries = total 3 attempts)
        // Note: The service layer already retries for 429s. This high-level retry is for other failures (network, timeout, json parse)
        if (currentItem.retryCount < 2) {
           console.log(`[Job ${item.id}] Retrying...`);
           return prev.map(f => f.id === item.id ? {
             ...f,
             status: 'rechecking', // Send back to queue
             retryCount: f.retryCount + 1,
             error: `Retry ${f.retryCount + 1}: ${err.message}`,
             lastProcessedAt: Date.now()
           } : f);
        }

        // Hard Fail
        return prev.map(f => f.id === item.id ? { 
          ...f, 
          status: 'error', 
          error: err.message || 'Processing failed',
          lastProcessedAt: Date.now()
        } : f);
      });
    }
  };


  // --- HELPERS ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: FileItem[] = Array.from(e.target.files).map(file => ({
        id: generateId(),
        file,
        status: 'idle',
        retryCount: 0
      }));
      setFileQueue(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    // Only allow removing if not currently processing
    setFileQueue(prev => prev.filter(f => f.id !== id || f.status === 'processing'));
  };

  const readFileAsBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const base64 = result.split(',')[1];
        const mimeType = result.split(';')[0].split(':')[1];
        resolve({ base64, mimeType });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getStatusDisplay = (item: FileItem) => {
    if (item.status === 'idle') return { text: 'Waiting', color: 'bg-gray-100 text-gray-500' };
    if (item.status === 'queued') return { text: 'Queued', color: 'bg-gray-200 text-gray-600' };
    if (item.status === 'rechecking') return { text: 'Rechecking...', color: 'bg-orange-100 text-orange-600' };
    if (item.status === 'processing') return { text: 'AI Analyzing...', color: 'bg-blue-100 text-blue-600' };
    if (item.status === 'success') {
       if (item.isRecovered) return { text: 'Recovered', color: 'bg-green-100 text-green-600 font-bold' };
       return { text: 'Complete', color: 'bg-green-100 text-green-600' };
    }
    if (item.status === 'error') {
       if (item.retryCount >= 2) return { text: 'Still Failed', color: 'bg-red-100 text-red-700 font-bold' };
       return { text: item.error || 'Failed', color: 'bg-red-100 text-red-600' };
    }
    return { text: 'Unknown', color: 'bg-gray-100' };
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
             <CloudUpload className="w-5 h-5 text-blue-600" />
          </div>
          Invoice Queue
        </h3>
        <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
          {processedCount} / {totalCount}
        </span>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)] ${isProcessing ? 'bg-blue-600 animate-pulse' : 'bg-blue-600'}`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      )}

      {/* Drop Zone / Empty State */}
      {fileQueue.length === 0 ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:bg-blue-50/50 hover:border-blue-200 transition-all cursor-pointer flex flex-col items-center justify-center flex-1 min-h-[240px] group"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Upload className="w-8 h-8" />
          </div>
          <p className="text-gray-900 font-semibold mb-1">Upload Invoices</p>
          <p className="text-sm text-gray-500 mb-4">Drag & drop or click to select PDF/Images</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*,application/pdf" 
            multiple 
            className="hidden" 
          />
          <Button variant="outline" className="pointer-events-none rounded-xl">
            Select Files
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-[240px] mb-4 space-y-3 pr-1 custom-scrollbar">
          {fileQueue.map((item, idx) => {
            const display = getStatusDisplay(item);
            return (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-3 rounded-xl border transition-all animate-fade-in ${
                  item.status === 'processing' ? 'border-blue-200 bg-blue-50/30' : 
                  item.status === 'rechecking' ? 'border-orange-200 bg-orange-50/30' :
                  item.status === 'success' ? 'border-green-200 bg-green-50/30' : 
                  item.status === 'error' ? 'border-red-200 bg-red-50/30' : 
                  'border-gray-100 bg-white hover:border-gray-200'
                }`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-lg ${
                     item.status === 'processing' ? 'bg-blue-100 text-blue-600' : 
                     item.status === 'rechecking' ? 'bg-orange-100 text-orange-600' :
                     item.status === 'success' ? 'bg-green-100 text-green-600' : 
                     item.status === 'error' ? 'bg-red-100 text-red-600' : 
                     'bg-gray-100 text-gray-500'
                  }`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate max-w-[140px]">{item.file.name}</p>
                    <p className={`text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded-md inline-block mt-1 ${display.color}`}>
                      {display.text}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === 'processing' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                  {item.status === 'rechecking' && <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />}
                  {item.status === 'queued' && <Clock className="w-4 h-4 text-gray-400" />}
                  {item.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {item.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                  
                  {/* Allow removing only if not currently actively processing */}
                  {(item.status === 'idle' || item.status === 'success' || item.status === 'error') && (
                    <button onClick={() => removeFile(item.id)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Bar */}
      <div className="mt-auto pt-4 border-t border-gray-100 flex gap-3">
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*,application/pdf" 
            multiple 
            className="hidden" 
        />
        <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1 rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
        <div className="flex gap-2 flex-1">
          <Button 
            onClick={startInvoiceProcessingQueue} 
            isLoading={isProcessing && !recheckSessionId} 
            disabled={isProcessing || fileQueue.filter(f => f.status === 'idle').length === 0}
            className="flex-1 rounded-xl shadow-lg shadow-blue-500/20"
          >
            <Play className="w-4 h-4 mr-2" />
            Process
          </Button>
          <Button 
             variant="secondary"
             onClick={recheckAllInvoices}
             disabled={isProcessing || fileQueue.length === 0}
             className="px-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
             title="Re-Check Batch"
          >
             <RefreshCw className={`w-4 h-4 ${recheckSessionId ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );
};