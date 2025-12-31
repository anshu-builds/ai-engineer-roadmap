import React, { useRef, useState } from 'react';
import { Upload, RefreshCw, Check, AlertTriangle, FileSpreadsheet, Loader2, AlertOctagon, Copy } from 'lucide-react';
import { Button } from './Button';
import { convertCsvToBankRows, cosineSimilarity, formatCurrency, generateId } from '../services/utils';
import { getEmbeddings } from '../services/geminiService';
import { BankTransaction, Invoice } from '../types';

interface BankReconciliationProps {
  invoices: Invoice[];
  transactions: BankTransaction[];
  onTransactionsLoaded: (transactions: BankTransaction[]) => void;
  onReconcile: (matchedTransactions: BankTransaction[]) => void;
}

export const BankReconciliation: React.FC<BankReconciliationProps> = ({ 
  invoices, 
  transactions, 
  onTransactionsLoaded,
  onReconcile
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isReconciling, setIsReconciling] = useState(false);
  const [progress, setProgress] = useState<{ step: string; percent: number } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      let allTransactions: BankTransaction[] = [];
      
      for (const file of files) {
        try {
          const text = await file.text();
          console.log(`[Upload] Processing file: ${file.name}`);
          
          // Use the robust CSV converter
          const rows = convertCsvToBankRows(text);
          
          const newTxns: BankTransaction[] = rows.map(r => ({
            id: generateId(),
            date: r.date || new Date().toISOString().split('T')[0], // Fallback date if missing
            description: r.description || 'Unknown Transaction',
            amount: r.amount,
            auditFlags: []
          }));

          allTransactions = [...allTransactions, ...newTxns];
        } catch (err) {
          console.error(`[Upload] Failed to parse ${file.name}`, err);
        }
      }
      
      const updatedList = [...transactions, ...allTransactions];
      onTransactionsLoaded(updatedList);
    }
  };

  const runReconciliation = async () => {
    setIsReconciling(true);
    setProgress({ step: 'Initializing Audit Engine...', percent: 0 });
    
    try {
      // 0. Pre-Audit: Identify Duplicate Invoices in the system
      const invoiceSignatures = new Map<string, string[]>();
      const duplicateInvoiceIds = new Set<string>();

      invoices.forEach(inv => {
        const signature = `${inv.vendorName.toLowerCase()}-${inv.totalAmount.toFixed(2)}-${inv.invoiceDate}`;
        if (invoiceSignatures.has(signature)) {
            duplicateInvoiceIds.add(inv.id);
            const existing = invoiceSignatures.get(signature);
            if(existing) existing.forEach(id => duplicateInvoiceIds.add(id));
        } else {
            invoiceSignatures.set(signature, [inv.id]);
        }
      });

      // 1. Prepare texts for embedding
      const invoiceTexts = invoices.map(inv => `Invoice for ${inv.vendorName} ${inv.description} amount ${inv.totalAmount}`);
      const txnTexts = transactions.map(txn => `Transaction ${txn.description} amount ${Math.abs(txn.amount)}`);

      // 2. Get embeddings
      setProgress({ step: 'Analyzing Invoices...', percent: 20 });
      await new Promise(r => setTimeout(r, 500));
      const invoiceEmbeddings = await getEmbeddings(invoiceTexts);
      
      setProgress({ step: 'Analyzing Bank Transactions...', percent: 50 });
      const txnEmbeddings = await getEmbeddings(txnTexts);

      // 3. Match
      setProgress({ step: 'Matching & Auditing...', percent: 80 });
      await new Promise(r => setTimeout(r, 500));

      const updatedTransactions = transactions.map(t => ({...t, auditFlags: [] as string[]}));
      const usedInvoiceIds = new Set<string>();

      for (let i = 0; i < updatedTransactions.length; i++) {
        const txn = updatedTransactions[i];
        const txnVec = txnEmbeddings[i];
        
        let bestMatchId: string | undefined;
        let bestScore = -1;
        let isAmountExact = false;

        for (let j = 0; j < invoices.length; j++) {
          if (usedInvoiceIds.has(invoices[j].id)) continue;

          const invAmount = invoices[j].totalAmount;
          const txnAmount = Math.abs(txn.amount);
          
          const amountDiff = Math.abs(invAmount - txnAmount);
          const isStrictAmount = amountDiff < 0.5;
          const isLooseAmount = amountDiff < (invAmount * 0.2); 

          if (!isLooseAmount) continue;

          const invVec = invoiceEmbeddings[j];
          if (invVec.length && txnVec.length) {
              const score = cosineSimilarity(txnVec, invVec);
              const finalScore = isStrictAmount ? score + 0.1 : score;

              if (finalScore > bestScore) {
                  bestScore = score;
                  bestMatchId = invoices[j].id;
                  isAmountExact = isStrictAmount;
              }
          }
        }

        const threshold = isAmountExact ? 0.45 : 0.85;

        if (bestScore > threshold && bestMatchId) {
          const matchedInvoice = invoices.find(inv => inv.id === bestMatchId);
          
          updatedTransactions[i].matchedInvoiceId = bestMatchId;
          updatedTransactions[i].matchConfidence = bestScore;
          updatedTransactions[i].auditFlags = [];

          if (!isAmountExact && matchedInvoice) {
             updatedTransactions[i].auditFlags?.push('amount_mismatch');
          }
          if (duplicateInvoiceIds.has(bestMatchId)) {
             updatedTransactions[i].auditFlags?.push('duplicate_invoice');
          }

          usedInvoiceIds.add(bestMatchId);
        }
      }

      setProgress({ step: 'Finalizing...', percent: 100 });
      onReconcile(updatedTransactions);
    } catch (error) {
      console.error("Reconciliation failed", error);
    } finally {
      setIsReconciling(false);
      setTimeout(() => setProgress(null), 1000); 
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-green-50 rounded-lg">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
            </div>
            Bank Transactions
          </h3>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <input 
              type="file" 
              accept=".csv,.txt" 
              multiple
              ref={fileRef} 
              className="hidden" 
              onChange={handleFileUpload} 
            />
            <Button variant="outline" onClick={() => fileRef.current?.click()} className="rounded-xl w-full sm:w-auto">
              <Upload className="w-4 h-4 mr-2" /> Upload CSV
            </Button>
            <Button 
              onClick={runReconciliation} 
              isLoading={isReconciling}
              disabled={transactions.length === 0 || invoices.length === 0}
              className="rounded-xl shadow-lg shadow-blue-500/20 w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Auto Reconcile
            </Button>
          </div>
        </div>

        {/* Progress Bar Area */}
        {progress && (
          <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 animate-fade-in">
            <div className="flex justify-between text-sm font-semibold text-blue-900 mb-2">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {progress.step}
              </span>
              <span>{progress.percent}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)]" 
                style={{ width: `${progress.percent}%` }}
              ></div>
            </div>
          </div>
        )}

        {transactions.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm text-left min-w-[800px]">
              <thead className="bg-gray-50/80 text-gray-500 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {transactions.map((txn, idx) => {
                  const matchedInvoice = invoices.find(inv => inv.id === txn.matchedInvoiceId);
                  const hasMismatch = txn.auditFlags?.includes('amount_mismatch');
                  const hasDuplicate = txn.auditFlags?.includes('duplicate_invoice');
                  
                  return (
                    <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-700 font-medium">{txn.date}</td>
                      <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]" title={txn.description}>{txn.description}</td>
                      <td className={`px-6 py-4 text-right font-bold font-mono ${txn.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(txn.amount)}
                      </td>
                      <td className="px-6 py-4">
                        {matchedInvoice ? (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              hasMismatch || hasDuplicate 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {hasMismatch || hasDuplicate ? (
                                <AlertTriangle className="w-3 h-3 mr-1.5" />
                            ) : (
                                <Check className="w-3 h-3 mr-1.5" />
                            )}
                            {hasMismatch || hasDuplicate ? 'Audit Warning' : 'Matched'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">
                            Unmatched
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {matchedInvoice ? (
                          <div className="flex flex-col gap-1.5">
                             <div className="text-xs flex items-center">
                                <span className="font-semibold text-gray-800">Linked: {matchedInvoice.vendorName}</span>
                                <div className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                    {(txn.matchConfidence! * 100).toFixed(0)}% Match
                                </div>
                             </div>
                             
                             {hasMismatch && (
                                <div className="text-xs flex items-center text-orange-700 bg-orange-50 px-2 py-1 rounded-md border border-orange-100 w-fit">
                                    <AlertOctagon className="w-3 h-3 mr-1.5" />
                                    <span>Diff: {formatCurrency(Math.abs(Math.abs(txn.amount) - matchedInvoice.totalAmount))}</span>
                                </div>
                             )}
                             {hasDuplicate && (
                                <div className="text-xs flex items-center text-red-700 bg-red-50 px-2 py-1 rounded-md border border-red-100 w-fit">
                                    <Copy className="w-3 h-3 mr-1.5" />
                                    Duplicate
                                </div>
                             )}
                          </div>
                        ) : <span className="text-gray-300">-</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mb-4">
               <FileSpreadsheet className="w-8 h-8 text-gray-300" />
             </div>
            <p>No transactions loaded yet</p>
            <p className="text-sm mt-1">Upload a CSV bank statement to start reconciling</p>
          </div>
        )}
      </div>
    </div>
  );
};