import React, { useState } from 'react';
import { LayoutDashboard, FileText, Split, PieChart, ShieldCheck, ChevronRight, Menu, X, Receipt } from 'lucide-react';
import { InvoiceUploader } from './components/InvoiceUploader';
import { BankReconciliation } from './components/BankReconciliation';
import { Reports } from './components/Reports';
import { Invoice, JournalEntry, BankTransaction } from './types';
import { formatCurrency } from './services/utils';

function App() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'reconciliation' | 'reports'>('invoices');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // App State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);

  const handleInvoiceProcessed = (invoice: Invoice, journal: JournalEntry) => {
    setInvoices(prev => [invoice, ...prev]);
    setJournalEntries(prev => [journal, ...prev]);
  };

  const handleTransactionsLoaded = (newTxns: BankTransaction[]) => {
    setTransactions(newTxns);
  };

  const handleReconcile = (updatedTxns: BankTransaction[]) => {
    setTransactions(updatedTxns);
    // Also update invoice statuses
    const matchedInvoiceIds = new Set(updatedTxns.filter(t => t.matchedInvoiceId).map(t => t.matchedInvoiceId));
    setInvoices(prev => prev.map(inv => matchedInvoiceIds.has(inv.id) ? { ...inv, status: 'reconciled' } : inv));
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] font-sans text-slate-800">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 z-40 px-6 py-4 flex justify-between items-center shadow-lg border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-1.5 rounded-lg">
             <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Auto-CA</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="text-slate-300 hover:text-white transition-colors p-1"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 h-full w-72 bg-slate-900 text-white flex flex-col z-50 shadow-2xl transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:h-screen
      `}>
        <div className="p-8 border-b border-slate-800/50 flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2.5 rounded-xl shadow-lg shadow-blue-900/40">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">Auto-CA</h1>
            <p className="text-[10px] uppercase tracking-wider text-blue-400 font-bold mt-1.5 opacity-90">Autonomous Agent</p>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Modules</p>
          {[
            { id: 'invoices', label: 'Invoices & Journal', icon: FileText, desc: 'Process & Extract' },
            { id: 'reconciliation', label: 'Bank Reconciliation', icon: Split, desc: 'Match & Audit' },
            { id: 'reports', label: 'Reports & P/L', icon: PieChart, desc: 'Analyze & Export' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => handleTabChange(item.id as any)}
              className={`group w-full flex items-center justify-between px-4 py-4 rounded-xl transition-all duration-300 border ${
                activeTab === item.id 
                  ? 'bg-blue-600/10 border-blue-600/20 text-blue-400 shadow-inner' 
                  : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg transition-colors ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                   <item.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className={`block font-semibold text-sm ${activeTab === item.id ? 'text-white' : 'text-slate-300'}`}>{item.label}</span>
                  <span className="text-[10px] opacity-60 font-medium">{item.desc}</span>
                </div>
              </div>
              {activeTab === item.id && <ChevronRight className="w-4 h-4 text-blue-400" />}
            </button>
          ))}
        </nav>

        <div className="p-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 border border-slate-700/50 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
               <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
               </div>
               <p className="text-xs font-bold text-slate-300 tracking-wide">SYSTEM ACTIVE</p>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Gemini 3 Pro is monitoring your data for accounting anomalies.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full p-4 pt-24 md:p-8 lg:p-12 md:ml-0">
        <header className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wide border border-blue-100">
                  {activeTab === 'invoices' && 'Module 01'}
                  {activeTab === 'reconciliation' && 'Module 02'}
                  {activeTab === 'reports' && 'Module 03'}
               </span>
               <span className="h-px w-8 bg-slate-200"></span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'invoices' && 'Invoice Processing'}
              {activeTab === 'reconciliation' && 'Reconciliation Engine'}
              {activeTab === 'reports' && 'Financial Reports & P/L'}
            </h2>
            <p className="text-slate-500 mt-2 text-sm md:text-lg font-light max-w-2xl">
              {activeTab === 'invoices' && 'Upload documents to automatically extract data, classify expenses, and generate journal entries using AI.'}
              {activeTab === 'reconciliation' && 'Intelligent matching of bank transactions with invoices using vector embeddings.'}
              {activeTab === 'reports' && 'Real-time financial insights, Profit / Loss statements, and exportable ledgers.'}
            </p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto min-h-[500px]">
          {/* Use key to trigger animation on tab change */}
          <div key={activeTab} className="animate-slide-up">
            {activeTab === 'invoices' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-1">
                  <InvoiceUploader onInvoiceProcessed={handleInvoiceProcessed} />
                </div>
                <div className="xl:col-span-2 space-y-6">
                   {invoices.length === 0 && (
                     <div className="text-center py-12 md:py-20 text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center group hover:border-blue-100 transition-colors">
                       <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                         <FileText className="w-8 h-8 md:w-10 md:h-10 text-slate-300 group-hover:text-blue-400 transition-colors" />
                       </div>
                       <h3 className="text-lg font-semibold text-slate-600 mb-1">No invoices processed yet</h3>
                       <p className="text-sm text-slate-400">Upload an invoice to see AI extraction in action</p>
                     </div>
                   )}
                   {invoices.map((inv) => (
                     <div key={inv.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300 group">
                       <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                         <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/30 shrink-0">
                              {inv.vendorName.substring(0,1).toUpperCase()}
                           </div>
                           <div className="min-w-0">
                             <p className="font-bold text-slate-900 text-lg truncate">{inv.vendorName}</p>
                             <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                               <span>{inv.invoiceDate}</span>
                               <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300"></span>
                               <span className="truncate max-w-[150px]">{inv.filename}</span>
                             </div>
                           </div>
                         </div>
                         <div className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                           inv.status === 'reconciled' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                         }`}>
                           {inv.status === 'reconciled' ? 'Reconciled' : 'Pending Review'}
                         </div>
                       </div>
                       <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                         <div className="space-y-1">
                           <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Category</p>
                           <p className="font-semibold text-slate-700 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              {inv.category}
                           </p>
                         </div>
                         <div className="sm:text-right space-y-1">
                           <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total Amount</p>
                           <p className="font-bold text-slate-900 text-2xl tracking-tight">{formatCurrency(inv.totalAmount, inv.currency)}</p>
                           {inv.taxAmount && inv.taxAmount > 0 && (
                             <div className="flex items-center justify-end gap-2 text-[10px] font-medium mt-1">
                               <span className="text-slate-400 flex items-center gap-1">
                                  <Receipt className="w-3 h-3" />
                                  Tax: {formatCurrency(inv.taxAmount, inv.currency)}
                               </span>
                               <span className="text-slate-300">|</span>
                               <span className="text-slate-500">Net: {formatCurrency(inv.totalAmount - inv.taxAmount, inv.currency)}</span>
                             </div>
                           )}
                         </div>
                         <div className="col-span-1 sm:col-span-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100 font-mono text-xs text-slate-600 group-hover:bg-slate-50 transition-colors">
                           <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 pb-2">
                             <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Journal Entry #{journalEntries.find(j => j.invoiceId === inv.id)?.id}
                             </p>
                             <span className="text-[10px] text-slate-400">Auto-Generated</span>
                           </div>
                           <div className="space-y-2">
                             {journalEntries.find(j => j.invoiceId === inv.id)?.debits.map((d, i) => (
                               <div key={`d-${i}`} className="flex justify-between items-center">
                                 <div className="flex items-center gap-2">
                                    <span className="text-emerald-600 font-bold text-[10px] px-1 bg-emerald-100 rounded">DR</span>
                                    <span className="font-semibold">{d.account}</span>
                                 </div>
                                 <span className="font-medium text-slate-900">{formatCurrency(d.amount)}</span>
                               </div>
                             ))}
                             {journalEntries.find(j => j.invoiceId === inv.id)?.credits.map((c, i) => (
                               <div key={`c-${i}`} className="flex justify-between items-center pl-4 border-l-2 border-slate-200 ml-1">
                                 <div className="flex items-center gap-2">
                                    <span className="text-amber-600 font-bold text-[10px] px-1 bg-amber-100 rounded">CR</span>
                                    <span className="text-slate-500">{c.account}</span>
                                 </div>
                                 <span className="text-slate-500">{formatCurrency(c.amount)}</span>
                               </div>
                             ))}
                           </div>
                         </div>
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {activeTab === 'reconciliation' && (
              <BankReconciliation 
                invoices={invoices} 
                transactions={transactions} 
                onTransactionsLoaded={handleTransactionsLoaded}
                onReconcile={handleReconcile}
              />
            )}

            {activeTab === 'reports' && (
              <Reports invoices={invoices} journalEntries={journalEntries} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;