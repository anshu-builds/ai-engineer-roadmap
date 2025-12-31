import { BankRow } from "../types";

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  // Use Indian locale for INR to get correct comma placement (e.g., 1,00,000)
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCompactNumber = (number: number, currency: string = 'USD') => {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
    currency: currency,
    style: "currency",
    maximumFractionDigits: 1
  }).format(number);
};

export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// --- ROBUST CSV PARSING ENGINE ---

/** Parses a flexible date string into YYYY-MM-DD */
const parseFlexibleDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const clean = dateStr.trim().replace(/['"]/g, '');
  
  // Try ISO YYYY-MM-DD first
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;

  // Try standard Date.parse (handles "Jan 1, 2024", "2024/01/01")
  const timestamp = Date.parse(clean);
  if (!isNaN(timestamp)) {
    return new Date(timestamp).toISOString().split('T')[0];
  }

  // Handle DD/MM/YYYY or MM/DD/YYYY formats manually
  // Regex to split by - / or .
  const parts = clean.split(/[-/.]/);
  if (parts.length === 3) {
    let d = parseInt(parts[0]);
    let m = parseInt(parts[1]);
    let y = parseInt(parts[2]);

    // Handle "2024-01-31" where split order is different or Year is first
    if (d > 1000) { [d, y] = [y, d]; [d, m] = [m, d]; } // Swap if first part is year

    // Heuristic: If middle > 12, it's likely MM-DD-YYYY is wrong, so assume DD-MM-YYYY
    // Heuristic: If first > 12, it's definitely DD-MM-YYYY
    if (m > 12 && d <= 12) { [d, m] = [m, d]; }
    
    // Normalize year 24 -> 2024
    if (y < 100) y += 2000;

    const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    // Verify validity
    if (!isNaN(Date.parse(iso))) return iso;
  }

  return ''; // Failed
};

/** Parses various number formats: "$1,200.00", "(500)", "1.200,00" */
const parseFlexibleAmount = (amtStr: string): number | null => {
  if (!amtStr) return null;
  let clean = amtStr.trim();
  
  // Handle parenthesis for negative: (100) -> -100
  const isNegativeParens = /^\(.*\)$/.test(clean);
  if (isNegativeParens) {
    clean = '-' + clean.replace(/[()]/g, '');
  }

  // Remove currency symbols and generic text
  clean = clean.replace(/[^0-9.,-]/g, '');

  // Check for European format (1.200,00) vs US/UK (1,200.00)
  // Heuristic: if last punctuation is ',' then it's decimal
  const lastComma = clean.lastIndexOf(',');
  const lastDot = clean.lastIndexOf('.');
  
  if (lastComma > lastDot && lastComma !== -1) {
    // Likely European: swap dot and comma for JS parsing
    clean = clean.replace(/\./g, '').replace(',', '.');
  } else {
    // Likely US/UK: just remove commas
    clean = clean.replace(/,/g, '');
  }

  const floatVal = parseFloat(clean);
  return isNaN(floatVal) ? null : floatVal;
};

/** Parses a single CSV line handling quotes properly */
const splitCsvLine = (line: string, delimiter: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'; // Double quote inside quotes
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

export const convertCsvToBankRows = (fileText: string): BankRow[] => {
  if (!fileText.trim()) return [];

  // 1. Detect Delimiter
  const firstLine = fileText.split('\n')[0];
  const delimiters = [',', ';', '\t', '|'];
  const delimiter = delimiters.reduce((a, b) => 
    (firstLine.split(a).length > firstLine.split(b).length ? a : b)
  );
  
  console.log(`[CSV] Detected delimiter: "${delimiter === '\t' ? '\\t' : delimiter}"`);

  // 2. Parse Lines
  const rawLines = fileText.split(/\r?\n/).filter(l => l.trim().length > 0);
  const parsedRows = rawLines.map(line => splitCsvLine(line, delimiter));

  // 3. Auto-detect Header Row & Columns
  let dateIdx = -1;
  let descIdx = -1;
  let amountIdx = -1;
  let debitIdx = -1;
  let creditIdx = -1;
  let headerRowIdx = 0;

  // Keywords
  const dateKeywords = ['date', 'txn_date', 'transaction date', 'value date', 'booking date', 'time'];
  const descKeywords = ['description', 'desc', 'narration', 'memo', 'remarks', 'particulars', 'details', 'reference'];
  const amountKeywords = ['amount', 'amt', 'value', 'inr', 'usd', 'eur', 'total'];
  const debitKeywords = ['debit', 'dr', 'withdrawal', 'paid', 'out'];
  const creditKeywords = ['credit', 'cr', 'deposit', 'received', 'in'];

  // Scan first 5 rows to find a header
  for (let i = 0; i < Math.min(5, parsedRows.length); i++) {
    const row = parsedRows[i].map(c => c.toLowerCase());
    
    // Find Date
    if (dateIdx === -1) dateIdx = row.findIndex(c => dateKeywords.some(k => c.includes(k)));
    
    // Find Description
    if (descIdx === -1) descIdx = row.findIndex(c => descKeywords.some(k => c.includes(k)));

    // Find Amount (Explicit)
    if (amountIdx === -1) amountIdx = row.findIndex(c => amountKeywords.some(k => c === k || c.includes(k)));

    // Find Debit/Credit
    if (debitIdx === -1) debitIdx = row.findIndex(c => debitKeywords.some(k => c === k || c.includes(k)));
    if (creditIdx === -1) creditIdx = row.findIndex(c => creditKeywords.some(k => c === k || c.includes(k)));

    if (dateIdx !== -1 && (amountIdx !== -1 || (debitIdx !== -1 && creditIdx !== -1))) {
      headerRowIdx = i;
      console.log(`[CSV] Found header at row ${i}`, { dateIdx, descIdx, amountIdx, debitIdx, creditIdx });
      break;
    }
  }

  // Fallback: If no header found, try to detect data types in the first few rows
  if (dateIdx === -1 || (amountIdx === -1 && debitIdx === -1)) {
    console.warn("[CSV] No header detected by keywords. Attempting data type sniffing...");
    const sampleRow = parsedRows[headerRowIdx + 1] || parsedRows[0];
    if (sampleRow) {
      if (dateIdx === -1) dateIdx = sampleRow.findIndex(c => parseFlexibleDate(c) !== '');
      if (amountIdx === -1) amountIdx = sampleRow.findIndex(c => parseFlexibleAmount(c) !== null);
    }
  }

  // 4. Extract Data
  const results: BankRow[] = [];
  
  for (let i = headerRowIdx + 1; i < parsedRows.length; i++) {
    const row = parsedRows[i];
    if (row.length < 2) continue; // Skip empty/malformed rows

    // Parse Date
    const dateStr = dateIdx !== -1 ? row[dateIdx] : '';
    const cleanDate = parseFlexibleDate(dateStr);

    // Parse Description
    let description = '';
    if (descIdx !== -1 && row[descIdx]) {
      description = row[descIdx];
    } else {
      // If no description column, combine all non-date/non-amount columns
      description = row.filter((_, idx) => idx !== dateIdx && idx !== amountIdx && idx !== debitIdx && idx !== creditIdx).join(' ').trim();
    }

    // Parse Amount
    let finalAmount: number | null = null;
    
    if (amountIdx !== -1) {
      finalAmount = parseFlexibleAmount(row[amountIdx]);
    } else if (debitIdx !== -1 && creditIdx !== -1) {
      const dr = parseFlexibleAmount(row[debitIdx]) || 0;
      const cr = parseFlexibleAmount(row[creditIdx]) || 0;
      // Usually Credit is Income (+), Debit is Expense (-)
      // If 'dr' is positive in the CSV, treat it as negative money flow
      finalAmount = Math.abs(cr) - Math.abs(dr);
    } else if (debitIdx !== -1) {
       // Only debit column found? Assume negative
       const val = parseFlexibleAmount(row[debitIdx]);
       if (val !== null) finalAmount = -Math.abs(val);
    } else if (creditIdx !== -1) {
       // Only credit column found? Assume positive
       const val = parseFlexibleAmount(row[creditIdx]);
       if (val !== null) finalAmount = Math.abs(val);
    }

    if (finalAmount !== null && !isNaN(finalAmount)) {
      results.push({
        index: i,
        date: cleanDate, // Can be empty if failed
        description: description.replace(/\s+/g, ' ').trim(), // Clean spaces
        amount: finalAmount
      });
    }
  }

  console.log(`[CSV] Parsed ${results.length} valid rows.`);
  return results;
};

// Legacy support wrapper (optional, but requested to keep util structure)
export const parseBankCSV = (csvText: string): any[] => {
   // Map BankRow back to legacy simple object if needed by older code, 
   // but primarily we use convertCsvToBankRows now.
   const rows = convertCsvToBankRows(csvText);
   return rows.map(r => ({ date: r.date, description: r.description, amount: r.amount }));
};