import React, { useState, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Download, Filter, FileText, TrendingUp, TrendingDown, DollarSign, Calendar, PieChart as PieChartIcon, BarChart3, IndianRupee, Euro, PoundSterling, Activity } from 'lucide-react';
import { Invoice, JournalEntry } from '../types';
import { formatCurrency, formatCompactNumber } from '../services/utils';
import { Button } from './Button';

interface ReportsProps {
  invoices: Invoice[];
  journalEntries: JournalEntry[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl text-sm ring-1 ring-black/5 animate-fade-in">
        <p className="text-gray-500 font-medium mb-1 text-xs uppercase tracking-wider">{label}</p>
        {payload.map((entry: any, index: number) => (
           <p key={index} className="font-bold font-mono text-lg tracking-tight flex items-center gap-2" style={{ color: entry.color }}>
             <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
             {entry.name}: {formatCurrency(entry.value, currency)}
           </p>
        ))}
      </div>
    );
  }
  return null;
};

export const Reports: React.FC<ReportsProps> = ({ invoices, journalEntries }) => {
  // Filter States
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  
  // View States
  const [showSummary, setShowSummary] = useState(true);
  const [showExpenseBreakdown, setShowExpenseBreakdown] = useState(true);
  const [showPnL, setShowPnL] = useState(true);
  const [showTrend, setShowTrend] = useState(true);

  // Derived Data
  const availableCurrencies = useMemo(() => {
    const currencies = new Set(invoices.map(i => i.currency));
    // Ensure default options exist even if no data
    currencies.add('USD');
    currencies.add('INR');
    currencies.add('EUR');
    currencies.add('GBP');
    return Array.from(currencies);
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (startDate && inv.invoiceDate < startDate) return false;
      if (endDate && inv.invoiceDate > endDate) return false;
      if (selectedCurrency && inv.currency !== selectedCurrency) return false;
      return true;
    });
  }, [invoices, startDate, endDate, selectedCurrency]);

  const expensesByCategory = useMemo(() => {
    return filteredInvoices.reduce((acc, inv) => {
      const existing = acc.find(i => i.name === inv.category);
      if (existing) {
        existing.value += inv.totalAmount;
      } else {
        acc.push({ name: inv.category, value: inv.totalAmount });
      }
      return acc;
    }, [] as { name: string; value: number }[]);
  }, [filteredInvoices]);

  const totalExpense = useMemo(() => filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0), [filteredInvoices]);

  // Mock revenue for P&L visualization (In a real app, this would come from sales invoices or bank credits)
  const mockRevenue = totalExpense * 1.5; 
  const netIncome = mockRevenue - totalExpense;

  const pnlData = [
    { name: 'Revenue', amount: mockRevenue, fill: '#3B82F6' },
    { name: 'Expenses', amount: totalExpense, fill: '#EF4444' },
    { name: 'Net Income', amount: netIncome, fill: '#10B981' },
  ];

  // Prepare Trend Data (Daily aggregation)
  const trendData = useMemo(() => {
    const dailyMap = new Map<string, { date: string, revenue: number, expenses: number, netIncome: number }>();
    
    // Sort invoices chronologically
    const sortedInvoices = [...filteredInvoices].sort((a, b) => a.invoiceDate.localeCompare(b.invoiceDate));

    sortedInvoices.forEach(inv => {
        const date = inv.invoiceDate;
        if (!dailyMap.has(date)) {
            dailyMap.set(date, { date, revenue: 0, expenses: 0, netIncome: 0 });
        }
        const entry = dailyMap.get(date)!;
        
        // Accumulate expenses
        entry.expenses += inv.totalAmount;
        
        // Mock Revenue logic consistent with snapshot (Expense * 1.5)
        const estimatedRevenue = inv.totalAmount * 1.5;
        entry.revenue += estimatedRevenue;
        
        entry.netIncome = entry.revenue - entry.expenses;
    });

    return Array.from(dailyMap.values());
  }, [filteredInvoices]);

  const escapeCsv = (str: string) => {
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportReportCSV = () => {
    const headers = ['Report Section', 'Category / Item', 'Amount', 'Currency'];
    const rows = [];

    // Always export P&L data
    rows.push(['P/L Snapshot', 'Revenue', mockRevenue.toFixed(2), selectedCurrency]);
    rows.push(['P/L Snapshot', 'Expenses', totalExpense.toFixed(2), selectedCurrency]);
    rows.push(['P/L Snapshot', 'Net Income', netIncome.toFixed(2), selectedCurrency]);

    // Always export Expense Breakdown
    expensesByCategory.forEach(item => {
        rows.push(['Expense Breakdown', item.name, item.value.toFixed(2), selectedCurrency]);
    });
    
    // Export Trend Data
    trendData.forEach(item => {
        rows.push(['Daily Trend', `Net Income (${item.date})`, item.netIncome.toFixed(2), selectedCurrency]);
    });

    const csvContent = [
      headers.map(escapeCsv).join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\n');

    downloadCSV(csvContent, `financial_report_${selectedCurrency}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportLedgerCSV = () => {
    const filteredEntries = journalEntries.filter(entry => {
        if (startDate && entry.date < startDate) return false;
        if (endDate && entry.date > endDate) return false;
        if (selectedCurrency && entry.invoiceId) {
            const invoice = invoices.find(inv => inv.id === entry.invoiceId);
            if (invoice && invoice.currency !== selectedCurrency) return false;
        }
        return true;
    });

    const headers = ['Date', 'Journal ID', 'Description', 'Reference (Inv#)', 'Account', 'Debit', 'Credit'];
    const rows: string[][] = [];

    filteredEntries.forEach(entry => {
        entry.debits.forEach(dr => {
            rows.push([
                entry.date,
                entry.id,
                entry.description,
                entry.invoiceId || 'N/A',
                dr.account,
                dr.amount.toFixed(2),
                '0.00'
            ]);
        });
        entry.credits.forEach(cr => {
             rows.push([
                entry.date,
                entry.id,
                entry.description,
                entry.invoiceId || 'N/A',
                cr.account,
                '0.00',
                cr.amount.toFixed(2)
            ]);
        });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\n');

    downloadCSV(csvContent, `general_ledger_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const hasData = filteredInvoices.length > 0;

  const getCurrencyIcon = (curr: string) => {
    switch (curr) {
      case 'INR': return <IndianRupee className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />;
      case 'EUR': return <Euro className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />;
      case 'GBP': return <PoundSterling className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />;
      default: return <DollarSign className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-slide-up pb-12">
      
      {/* 0. Top Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h3>
            <p className="text-sm text-gray-500 font-medium">Track key financial metrics and performance</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" onClick={handleExportReportCSV} disabled={!hasData} className="rounded-xl bg-white border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all hover:shadow">
                <Download className="w-4 h-4 mr-2" />
                Export Report
             </Button>
             <Button variant="primary" onClick={handleExportLedgerCSV} disabled={journalEntries.length === 0} className="rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30">
                <FileText className="w-4 h-4 mr-2" />
                Export Ledger
             </Button>
          </div>
      </div>

      {/* 1. Header & Controls */}
      <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col xl:flex-row justify-between gap-6 items-start xl:items-center">
        
        {/* Filter Group */}
        <div className="flex flex-wrap items-center gap-4 w-full">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50/50 hover:bg-gray-50 rounded-2xl border border-gray-200 transition-colors group focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300">
            <Calendar className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-sm border-none focus:ring-0 p-0 text-gray-700 w-32 outline-none font-semibold font-sans"
              placeholder="Start Date"
            />
            <span className="text-gray-400 font-light mx-1">to</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-sm border-none focus:ring-0 p-0 text-gray-700 w-32 outline-none font-semibold font-sans"
              placeholder="End Date"
            />
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50/50 hover:bg-gray-50 rounded-2xl border border-gray-200 transition-colors group">
            {getCurrencyIcon(selectedCurrency)}
            <select 
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-transparent text-sm border-none focus:ring-0 p-0 text-gray-700 font-bold cursor-pointer pr-8 outline-none min-w-[80px]"
            >
              {availableCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex-1"></div>

          {/* View Toggles */}
          <div className="flex bg-gray-100/80 p-1.5 rounded-2xl overflow-x-auto max-w-full">
             {[
               { id: 'summary', label: 'Summary', icon: DollarSign, state: showSummary, setState: setShowSummary },
               { id: 'expenses', label: 'Breakdown', icon: PieChartIcon, state: showExpenseBreakdown, setState: setShowExpenseBreakdown },
               { id: 'pnl', label: 'Snapshot', icon: BarChart3, state: showPnL, setState: setShowPnL },
               { id: 'trend', label: 'Trend', icon: Activity, state: showTrend, setState: setShowTrend },
             ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.setState(!item.state)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-300 whitespace-nowrap ${
                    item.state ? 'bg-white text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600 hover:bg-black/5'
                  }`}
                >
                  <item.icon className={`w-3.5 h-3.5 ${item.state ? 'text-blue-600' : 'text-gray-400'}`} />
                  {item.label}
                </button>
             ))}
          </div>
        </div>
      </div>

      {hasData ? (
        <div className="space-y-6">
          {/* 2. KPI Cards - Staggered Animation */}
          {showSummary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div 
                className="bg-white p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 relative overflow-hidden group hover:shadow-[0_8px_30px_-4px_rgba(59,130,246,0.1)] transition-all duration-500 animate-fade-in hover:-translate-y-1"
                style={{ animationDelay: '0s' }}
              >
                <div className="absolute right-0 top-0 p-6 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity duration-500 transform group-hover:scale-110 group-hover:rotate-12">
                  <TrendingUp className="w-32 h-32 text-blue-600" />
                </div>
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="p-3.5 bg-blue-50/80 text-blue-600 rounded-2xl">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-100 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> 12.5%
                  </span>
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-bold text-gray-400 mb-2 tracking-wide uppercase">Total Revenue</p>
                  <h3 className="text-4xl font-extrabold text-gray-900 tracking-tight font-sans">
                    {formatCurrency(mockRevenue, selectedCurrency)}
                  </h3>
                </div>
              </div>

              <div 
                className="bg-white p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 relative overflow-hidden group hover:shadow-[0_8px_30px_-4px_rgba(239,68,68,0.1)] transition-all duration-500 animate-fade-in hover:-translate-y-1"
                style={{ animationDelay: '0.1s' }}
              >
                <div className="absolute right-0 top-0 p-6 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity duration-500 transform group-hover:scale-110 group-hover:rotate-12">
                   <TrendingDown className="w-32 h-32 text-red-600" />
                </div>
                <div className="flex justify-between items-start mb-8 relative z-10">
                   <div className="p-3.5 bg-red-50/80 text-red-600 rounded-2xl">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 bg-red-50 text-red-700 rounded-full border border-red-100 flex items-center gap-1">
                     <TrendingUp className="w-3 h-3" /> 4.2%
                  </span>
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-bold text-gray-400 mb-2 tracking-wide uppercase">Total Expenses</p>
                  <h3 className="text-4xl font-extrabold text-gray-900 tracking-tight font-sans">
                    {formatCurrency(totalExpense, selectedCurrency)}
                  </h3>
                </div>
              </div>

              <div 
                className="bg-white p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 relative overflow-hidden group hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.1)] transition-all duration-500 animate-fade-in hover:-translate-y-1"
                style={{ animationDelay: '0.2s' }}
              >
                <div className="absolute right-0 top-0 p-6 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity duration-500 transform group-hover:scale-110 group-hover:rotate-12">
                  <DollarSign className="w-32 h-32 text-emerald-600" />
                </div>
                <div className="flex justify-between items-start mb-8 relative z-10">
                   <div className="p-3.5 bg-emerald-50/80 text-emerald-600 rounded-2xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">Healthy</span>
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-bold text-gray-400 mb-2 tracking-wide uppercase">Net Income</p>
                  <h3 className="text-4xl font-extrabold text-gray-900 tracking-tight font-sans">
                    {formatCurrency(netIncome, selectedCurrency)}
                  </h3>
                </div>
              </div>

            </div>
          )}

          {/* 3. Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            
            {showPnL && (
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col h-[500px] hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">P/L Snapshot</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">Revenue vs Expenses vs Income</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-xl">
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pnlData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }} barSize={60}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 600 }} 
                        dy={15}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                        tickFormatter={(val) => formatCompactNumber(val, selectedCurrency)}
                        dx={-10}
                      />
                      <Tooltip content={<CustomTooltip currency={selectedCurrency} />} cursor={{ fill: '#F9FAFB', radius: 12 }} />
                      <Bar dataKey="amount" radius={[16, 16, 16, 16]} animationDuration={1500}>
                        {pnlData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.name === 'Expenses' ? '#EF4444' : entry.name === 'Revenue' ? '#3B82F6' : '#10B981'} 
                            />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {showExpenseBreakdown && (
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col h-[500px] hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500">
                 <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Expense Distribution</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">Breakdown by category</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-xl">
                    <PieChartIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1 w-full min-h-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={100}
                        outerRadius={150}
                        paddingAngle={6}
                        dataKey="value"
                        cornerRadius={8}
                        animationDuration={1500}
                        animationBegin={200}
                        stroke="none"
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip currency={selectedCurrency} />} />
                      <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        wrapperStyle={{ fontSize: '13px', color: '#4B5563', fontWeight: 600 }}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none md:pr-24">
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                     <p className="text-xl font-extrabold text-gray-900">
                       {formatCompactNumber(totalExpense, selectedCurrency)}
                     </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* 4. Trend Line Chart */}
          {showTrend && (
             <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col h-[400px] hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Net Income Trend</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">Financial performance timeline</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-xl">
                    <Activity className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 600 }} 
                        dy={15}
                        padding={{ left: 20, right: 20 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                        tickFormatter={(val) => formatCompactNumber(val, selectedCurrency)}
                        dx={-10}
                      />
                      <Tooltip content={<CustomTooltip currency={selectedCurrency} />} cursor={{ stroke: '#E5E7EB', strokeWidth: 2 }} />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        name="Est. Revenue"
                        stroke="#3B82F6" 
                        strokeWidth={3} 
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        strokeOpacity={0.5}
                        strokeDasharray="5 5"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expenses" 
                        name="Expenses"
                        stroke="#EF4444" 
                        strokeWidth={3} 
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        strokeOpacity={0.5}
                        strokeDasharray="5 5"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="netIncome" 
                        name="Net Income"
                        stroke="#10B981" 
                        strokeWidth={4} 
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                        activeDot={{ r: 7, strokeWidth: 0, fill: '#10B981' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
             </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-[2rem] border border-gray-100 p-12 text-center flex flex-col items-center justify-center min-h-[400px] animate-fade-in shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
             <Filter className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No data found</h3>
          <p className="text-gray-500 max-w-sm mb-8">
            We couldn't find any transactions matching your filters. Try adjusting the date range or select a different currency.
          </p>
          <div className="flex gap-2">
             <Button variant="outline" onClick={() => { setStartDate(''); setEndDate(''); }} className="rounded-xl px-6 py-2.5">
                Clear All Filters
             </Button>
          </div>
        </div>
      )}
    </div>
  );
};