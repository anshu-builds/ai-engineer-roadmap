export enum ExpenseCategory {
  OfficeSupplies = 'Office Supplies',
  TravelAccommodation = 'Travel & Accommodation',
  Salaries = 'Salaries',
  Subscriptions = 'Subscriptions',
  Utilities = 'Utilities',
  FoodEntertainment = 'Food & Entertainment',
  Miscellaneous = 'Miscellaneous',
  Uncategorized = 'Uncategorized'
}

export interface Invoice {
  id: string;
  filename: string;
  vendorName: string;
  invoiceDate: string;
  totalAmount: number;
  taxAmount?: number;
  currency: string;
  description: string;
  category: ExpenseCategory;
  confidence: number;
  status: 'extracted' | 'posted' | 'reconciled';
  embedding?: number[];
  imageUrl?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debits: { account: string; amount: number }[];
  credits: { account: string; amount: number }[];
  invoiceId?: string;
}

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number; // Negative for expense, positive for income
  embedding?: number[];
  matchedInvoiceId?: string;
  matchConfidence?: number;
  auditFlags?: string[]; // 'duplicate_invoice', 'amount_mismatch'
}

export interface BankRow {
  index: number;
  date: string;
  description: string;
  amount: number;
}

export interface LedgerSummary {
  revenue: number;
  expenses: number;
  netIncome: number;
  categoryBreakdown: { name: string; value: number }[];
}

export interface MatchResult {
  transactionId: string;
  invoiceId: string;
  score: number;
}