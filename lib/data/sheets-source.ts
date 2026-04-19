import { parse } from "csv-parse/sync";
import type { ProductSalesStat, Retailer } from "@/lib/types";

// Public reads from a "Anyone with link: Viewer" Google Sheet via gviz CSV endpoint.
// No auth required.

const SHEET_ID = process.env.GOOGLE_SHEET_ID || "";

// TTL caches so we don't hit Google on every request
interface TTLCache<V> {
  value: V;
  expiresAt: number;
}
const caches = new Map<string, TTLCache<unknown>>();

function getCached<V>(key: string): V | null {
  const entry = caches.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    caches.delete(key);
    return null;
  }
  return entry.value as V;
}
function setCached<V>(key: string, value: V, ttlMs: number): V {
  caches.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

async function fetchSheetAsCsv(tabName: string): Promise<string> {
  if (!SHEET_ID) throw new Error("GOOGLE_SHEET_ID is not set");
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Google Sheets fetch failed (${res.status}) for tab "${tabName}"`);
  }
  return await res.text();
}

function parseCsv(text: string): Record<string, string>[] {
  return parse(text, {
    columns: true,
    relax_quotes: true,
    relax_column_count: true,
    skip_empty_lines: true,
    trim: true,
  });
}

export async function fetchRetailersFromSheet(ttlMs = 120_000): Promise<Retailer[]> {
  const cached = getCached<Retailer[]>("retailers");
  if (cached) return cached;
  const text = await fetchSheetAsCsv("retailers");
  const rows = parseCsv(text);
  const out: Retailer[] = rows.map((r) => ({
    id: `ret-${r.phone}`,
    phone: String(r.phone || "").trim(),
    name: String(r.name || "").trim(),
    shopName: String(r.shopName || "").trim(),
    distributorId: String(r.distributorId || "").trim(),
    salesTerritoryId: String(r.salesTerritoryId || "").trim(),
    avatarSeed: String(r.phone || "").trim(),
  })).filter((r) => /^\d{10}$/.test(r.phone));
  return setCached("retailers", out, ttlMs);
}

export async function fetchAllSalesFromSheet(ttlMs = 30_000): Promise<Map<string, Map<string, ProductSalesStat>>> {
  const cached = getCached<Map<string, Map<string, ProductSalesStat>>>("sales");
  if (cached) return cached;
  const text = await fetchSheetAsCsv("sales");
  const rows = parseCsv(text);
  const byST = new Map<string, Map<string, ProductSalesStat>>();
  for (const r of rows) {
    const stId = String(r.stId || "").trim();
    const productId = String(r.productId || "").trim();
    if (!stId || !productId) continue;
    const stat: ProductSalesStat = {
      productId,
      salesRs: Number(r.salesRs) || 0,
      brRs: Number(r.brRs) || 0,
      repeatCount: Number(r.repeatCount) || 0,
    };
    const bucket = byST.get(stId) ?? new Map<string, ProductSalesStat>();
    bucket.set(productId, stat);
    byST.set(stId, bucket);
  }
  return setCached("sales", byST, ttlMs);
}

export function isSheetsConfigured(): boolean {
  return process.env.DATA_SOURCE === "sheets" && !!SHEET_ID;
}
