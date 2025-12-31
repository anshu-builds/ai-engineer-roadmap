/* Safe Gemini helper for generating invoice JSON, journal suggestions, and embeddings.
   Works with typical shapes returned by Google genai SDKs (generateContent / embedContent).
   - Use GEMINI API key via process.env.API_KEY
   - Normalizes embedding response to number[] via embeddings[0].values
   - Normalizes content response by trying several common response fields
*/

import { GoogleGenAI, Type } from "@google/genai";
import { ExpenseCategory } from "../types";

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/** Helper: safe extractor for embeddings. Accepts raw SDK response */
function extractFirstEmbedding(raw: any): number[] {
  try {
    // Primary modern shape: { embeddings: [ { values: number[] } ] }
    const eArr = raw?.embeddings ?? raw?.embedding ?? null;
    if (Array.isArray(eArr) && eArr.length > 0) {
      const first = eArr[0];
      if (Array.isArray(first?.values)) return first.values;
      // sometimes embeddings[0] might directly be number[] (rare)
      if (Array.isArray(first)) return first as number[];
    }
    // older fallback: response.embedding is direct array
    if (Array.isArray(raw?.embedding)) return raw.embedding as number[];
  } catch (err) {
    // swallow
  }
  return [];
}

/** Helper: safe extractor for the text/json payload returned by generateContent */
function extractGenerateContentText(resp: any): string {
  // SDKs differ on shape. Try common fields in order of likelihood.
  try {
    // 1) Some SDKs put the top-level combined text in .text
    if (typeof resp?.text === "string" && resp.text.trim().length > 0) return resp.text;

    // 2) Some SDKs use candidates / content array
    // e.g. resp?.candidates?.[0]?.content or resp?.candidates?.[0]?.message?.content
    if (Array.isArray(resp?.candidates) && resp.candidates.length > 0) {
      const cand = resp.candidates[0];
      if (typeof cand?.text === "string" && cand.text.trim().length > 0) return cand.text;
      if (Array.isArray(cand?.content) && cand.content.length > 0) {
        // try to find a text part
        for (const c of cand.content) {
          if (typeof c?.text === "string" && c.text.trim().length > 0) return c.text;
        }
      }
    }

    // 3) Some clients return content in resp?.content?.[0]?.text
    if (Array.isArray(resp?.content) && resp.content.length > 0) {
      const c0 = resp.content[0];
      if (typeof c0?.text === "string" && c0.text.trim().length > 0) return c0.text;
    }

    // 4) If SDK returns JSON-like `response.output[0].content[0].text` - try generic search
    const flattened = JSON.stringify(resp);
    // try to heuristically extract JSON substring if a JSON string was returned somewhere
    const idx = flattened.indexOf("{");
    if (idx >= 0) {
      const maybeJson = flattened.substring(idx);
      return maybeJson;
    }
  } catch (err) {
    // ignore and fallback
  }
  return "";
}

/** Parse text into JSON safely. Returns object or {} on fail. */
function safeParseJson(text: string) {
  if (!text || typeof text !== "string") return {};
  // Trim BOM and whitespace
  const s = text.trim();
  try {
    return JSON.parse(s);
  } catch (err) {
    // If the SDK returned something like "```json\n{...}\n```", try to strip code fences
    const cleaned = s.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    try {
      return JSON.parse(cleaned);
    } catch (err2) {
      // Last resort: find first "{" and last "}" and parse substring
      const first = cleaned.indexOf("{");
      const last = cleaned.lastIndexOf("}");
      if (first !== -1 && last !== -1 && last > first) {
        try {
          return JSON.parse(cleaned.substring(first, last + 1));
        } catch (err3) {
          // give up
        }
      }
    }
  }
  return {};
}

/** 
 * Retry wrapper for Gemini API calls to handle 429 Rate Limits.
 * Exponential backoff: 2s -> 4s -> 8s -> 16s
 */
async function retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3, baseDelay: number = 2000): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (err: any) {
      lastError = err;
      
      // Check for Rate Limit / Quota Exhausted errors
      const isRateLimit = 
        err?.status === 429 || 
        err?.code === 429 || 
        (typeof err?.message === 'string' && (
          err.message.includes('429') || 
          err.message.includes('RESOURCE_EXHAUSTED') || 
          err.message.includes('quota')
        ));
      
      if (isRateLimit && i < maxRetries) {
        const delay = baseDelay * Math.pow(2, i);
        console.warn(`[Gemini] Rate limit hit. Retrying attempt ${i + 1}/${maxRetries} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If not a rate limit error, or retries exhausted, throw immediately
      throw err;
    }
  }
  throw lastError;
}

/** Public: extract invoice structured data from a base64 image */
export async function extractInvoiceData(imageBase64: string, mimeType = "image/jpeg") {
  if (!ai) {
    throw new Error("Gemini client not configured. Set API key in environment.");
  }

  const prompt = `
      Analyze this invoice image. Extract the following fields:
      - Vendor Name
      - Invoice Date (YYYY-MM-DD)
      - Total Amount (numeric)
      - Tax Amount (numeric): Look for 'GST', 'VAT', 'Tax', 'HST'. Sum multiple tax lines (e.g., CGST + SGST) if present. If the invoice is 'Inclusive of Tax', try to extract the breakdown or set to 0 if not explicitly shown.
      - Currency (e.g., USD, EUR, INR)
      - Short Description (summary of items)

      Also, based on the items and vendor, suggest an Expense Category from this list:
      [${Object.values(ExpenseCategory).join(", ")}]

      Return a JSON object with keys: vendorName, invoiceDate, totalAmount, taxAmount, currency, description, category, confidence (0-1).
  `;

  try {
    return await retryOperation(async () => {
      const resp = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              vendorName: { type: Type.STRING },
              invoiceDate: { type: Type.STRING },
              totalAmount: { type: Type.NUMBER },
              taxAmount: { type: Type.NUMBER },
              currency: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
            },
          },
        },
      });

      const txt = extractGenerateContentText(resp);
      const parsed = safeParseJson(txt);
      // be defensive: ensure keys exist with defaults
      return {
        vendorName: parsed.vendorName ?? parsed.vendor ?? "",
        invoiceDate: parsed.invoiceDate ?? parsed.date ?? "",
        totalAmount: parsed.totalAmount ?? parsed.total ?? 0,
        taxAmount: parsed.taxAmount ?? 0,
        currency: parsed.currency ?? "INR",
        description: parsed.description ?? parsed.summary ?? "",
        category: parsed.category ?? parsed.categorySuggestion ?? "",
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.0,
        raw: parsed,
      };
    });
  } catch (err) {
    console.error("extractInvoiceData error:", err);
    throw err; // Let the caller handle the final failure
  }
}

/** Public: generate journal entry JSON using LLM */
export async function generateJournalEntryData(invoice: any) {
  if (!ai) {
    throw new Error("Gemini client not configured. Set API key in environment.");
  }

  const prompt = `
      Create a double-entry journal entry for this transaction.
      Vendor: ${invoice.vendorName ?? invoice.vendor ?? ""}
      Total Amount: ${invoice.totalAmount ?? invoice.amount ?? 0}
      Tax Amount: ${invoice.taxAmount ?? 0}
      Category: ${invoice.category ?? ""}
      Date: ${invoice.invoiceDate ?? invoice.date ?? ""}

      Accounting Logic:
      1. Credit 'Accounts Payable' for the Total Amount.
      2. If Tax Amount is greater than 0, Debit 'Input Tax Receivable' (or 'GST Receivable', 'VAT Input' as appropriate for the region/currency) for the Tax Amount.
      3. Debit the appropriate Expense Account (based on Category) for the Net Amount (Total - Tax).

      Return JSON with 'debits' and 'credits' arrays containing { account, amount }.
  `;

  try {
    return await retryOperation(async () => {
      const resp = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              debits: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    account: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                  },
                },
              },
              credits: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    account: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                  },
                },
              },
            },
          },
        },
      });

      const txt = extractGenerateContentText(resp);
      const parsed = safeParseJson(txt);
      return {
        debits: Array.isArray(parsed.debits) ? parsed.debits : [],
        credits: Array.isArray(parsed.credits) ? parsed.credits : [],
        raw: parsed,
      };
    });
  } catch (err) {
    console.error("generateJournalEntryData error:", err);
    throw err;
  }
}

/** Public: get embeddings for list of texts (sequential for safety) */
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  if (!ai) {
    console.warn("Gemini client not configured, returning empty embeddings.");
    return texts.map(() => []);
  }

  const EMBED_MODEL = "text-embedding-004";
  const out: number[][] = [];

  for (const t of texts) {
    try {
      // Embedding calls are also subject to rate limits, wrap them
      await retryOperation(async () => {
        const res = await ai.models.embedContent({
          model: EMBED_MODEL,
          contents: t,
        });
        const emb = extractFirstEmbedding(res);
        out.push(emb);
      });
    } catch (err) {
      console.error("embedContent error for text:", t.slice(0, 80), err);
      out.push([]);
    }
  }

  return out;
}

export default {
  extractInvoiceData,
  generateJournalEntryData,
  getEmbeddings,
};