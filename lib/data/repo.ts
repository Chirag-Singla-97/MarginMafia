import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import type {
  CategoryId,
  Distributor,
  POGEntry,
  Product,
  ProductSalesStat,
  Retailer,
  SalesTerritory,
  Team,
  Town,
} from "@/lib/types";
import { hash, seededInt } from "@/lib/utils";
import {
  fetchAllSalesFromSheet,
  fetchRetailersFromSheet,
  isSheetsConfigured,
} from "./sheets-source";

// -------- Category mapping --------

function mapCategory(rawCat: string, rawSub: string): CategoryId | null {
  const c = (rawCat || "").trim().toLowerCase();
  const sc = (rawSub || "").trim().toLowerCase();
  if (c.startsWith("plant nutrition")) return "spec-plant-nutrition";
  if (c.startsWith("crop protection")) return "crop-protection";
  if (c.startsWith("seeds")) {
    if (sc.includes("vegetable")) return "veg-seeds";
    if (sc.includes("super paddy") || sc.includes("super wheat")) return "research-seeds";
    return "hybrid-seeds";
  }
  return null;
}

function splitBullets(s: string): string[] {
  if (!s) return [];
  return s
    .split(/\r?\n|•|·|;/)
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
}

// -------- File paths --------

const DATA_DIR = path.join(process.cwd(), "lib", "data");
const PRODUCTS_CSV = path.join(DATA_DIR, "products.csv");
const RETAILERS_CSV = path.join(DATA_DIR, "retailers.csv");
const PINCODES_CSV = path.join(DATA_DIR, "pincodes.csv");
const POG_CSV = path.join(DATA_DIR, "pog.csv");
const salesCsvFor = (stId: string) => path.join(DATA_DIR, `sales_${stId}.csv`);

// -------- Caches (read-through) --------

let productsCache: Product[] | null = null;
let productsByIdCache: Map<string, Product> | null = null;
let retailersCache: Retailer[] | null = null;
let pincodeCache: Map<string, Town> | null = null;
const salesCache = new Map<string, Map<string, ProductSalesStat>>();

// -------- Runtime (mutable) state --------

interface RuntimeState {
  retailerOverrides: Map<string, Retailer>; // retailerId -> override (e.g. town, pincode attach)
  pincodeByRetailer: Map<string, string>;   // retailerId -> pincode chosen at login
  teams: Map<string, Team>;                 // saved teams (retailerId -> team)
  pogByST: Map<string, POGEntry[]>;         // stId -> entries (loaded from pog.csv on first access)
  pogLoaded: boolean;
  // Sheets mirrors (populated when DATA_SOURCE=sheets)
  sheetRetailers: Retailer[] | null;
  sheetSales: Map<string, Map<string, ProductSalesStat>> | null;
  sheetWarmPromise: Promise<void> | null;
}

const globalForRuntime = globalThis as unknown as { __mmRuntime?: RuntimeState };
function runtime(): RuntimeState {
  if (!globalForRuntime.__mmRuntime) {
    globalForRuntime.__mmRuntime = {
      retailerOverrides: new Map(),
      pincodeByRetailer: new Map(),
      teams: new Map(),
      pogByST: new Map(),
      pogLoaded: false,
      sheetRetailers: null,
      sheetSales: null,
      sheetWarmPromise: null,
    };
  }
  return globalForRuntime.__mmRuntime!;
}

async function warmSheets(): Promise<void> {
  try {
    const [retailers, sales] = await Promise.all([
      fetchRetailersFromSheet(),
      fetchAllSalesFromSheet(),
    ]);
    const rt = runtime();
    const wasCold = !rt.sheetRetailers;
    rt.sheetRetailers = retailers;
    rt.sheetSales = sales;
    if (wasCold) {
      const salesRows = [...sales.values()].reduce((sum, m) => sum + m.size, 0);
      // eslint-disable-next-line no-console
      console.log(`[repo] Google Sheets loaded: ${retailers.length} retailers, ${salesRows} sales rows across ${sales.size} STs`);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[repo] Google Sheets fetch failed; falling back to local CSVs:", (e as Error).message);
  }
}

// Call from API routes before using retailer/sales data. Blocks once on first call
// per process; subsequent calls are no-ops. Refresh happens via TTL in sheets-source.
export async function ensureSheetsWarm(): Promise<void> {
  if (!isSheetsConfigured()) return;
  const rt = runtime();
  if (rt.sheetRetailers && rt.sheetSales) {
    // Kick off a non-blocking refresh; sheets-source TTL decides if it actually refetches.
    if (!rt.sheetWarmPromise) {
      rt.sheetWarmPromise = warmSheets()
        .catch(() => {})
        .finally(() => {
          const r = runtime();
          r.sheetWarmPromise = null;
        });
    }
    return;
  }
  if (!rt.sheetWarmPromise) rt.sheetWarmPromise = warmSheets();
  try {
    await rt.sheetWarmPromise;
  } finally {
    rt.sheetWarmPromise = null;
  }
}

// -------- Hardcoded territories & distributors --------

const TERRITORIES: SalesTerritory[] = [
  { id: "st-north", name: "North Zone", region: "Punjab · Haryana · UP" },
  { id: "st-west", name: "West Zone", region: "Maharashtra · Gujarat · MP" },
  { id: "st-south", name: "South Zone", region: "Karnataka · Andhra · Telangana" },
];

const DISTRIBUTORS: Distributor[] = [
  { id: "dist-annapurna", name: "Annapurna Agro", salesTerritoryId: "st-north", city: "Ludhiana" },
  { id: "dist-bhoomi", name: "Bhoomi Krishi Kendra", salesTerritoryId: "st-north", city: "Karnal" },
  { id: "dist-kisanmitra", name: "Kisan Mitra Traders", salesTerritoryId: "st-north", city: "Lucknow" },
  { id: "dist-greenvalley", name: "Green Valley Distributors", salesTerritoryId: "st-west", city: "Pune" },
  { id: "dist-sahyadri", name: "Sahyadri Agro Supplies", salesTerritoryId: "st-west", city: "Nashik" },
  { id: "dist-narmada", name: "Narmada Krishi Bhandar", salesTerritoryId: "st-west", city: "Indore" },
  { id: "dist-deccan", name: "Deccan Agri Mart", salesTerritoryId: "st-south", city: "Bengaluru" },
  { id: "dist-kaveri", name: "Kaveri Krishi Kendra", salesTerritoryId: "st-south", city: "Mysuru" },
  { id: "dist-godavari", name: "Godavari Farm Supplies", salesTerritoryId: "st-south", city: "Hyderabad" },
];

// -------- Loaders --------

function loadProducts(): Product[] {
  if (productsCache) return productsCache;
  const raw = fs.readFileSync(PRODUCTS_CSV, "utf8");
  const rows: Record<string, string>[] = parse(raw, {
    columns: true,
    relax_quotes: true,
    relax_column_count: true,
    skip_empty_lines: true,
    trim: true,
  });
  const out: Product[] = [];
  const seen = new Set<string>();
  for (const r of rows) {
    const name = (r["Product Name"] || "").trim();
    if (!name) continue;
    const status = (r["Status*"] || r["Status"] || "").trim();
    if (status && status.toLowerCase() !== "active") continue;
    const cat = mapCategory(r["Category"] || "", r["Sub-category"] || "");
    if (!cat) continue;
    const uniqueId = (r["Product Unique ID*"] || r["Product Unique ID"] || "").trim();
    const sku = (r["SKU"] || "").trim();
    const id = (uniqueId || `${name}-${sku || out.length}`).replace(/\s+/g, "-").toLowerCase();
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      name,
      category: cat,
      subCategory: (r["Sub-category"] || "").trim(),
      composition: (r["Techncal composition"] || r["Technical composition"] || "").trim(),
      sku,
      cropTarget: (r["Crop/Target Crop"] || "").trim(),
      shortDesc: (r["1 lineShort Description"] || r["1 line Short Description"] || "").trim(),
      usp: splitBullets((r["USP's (For CCC, Include mode of action here)"] || r["USPs"] || "").trim()),
      dosage: (r["Dosage"] || "").trim(),
      applicationMethod: (r["Method of application"] || "").trim(),
      applicationTime: (r["Time of sowing /Time of application"] || r["Time of application"] || "").trim(),
      season: (r["Season"] || "").trim(),
      geographies: (r["Geographies"] || "").trim(),
      disclaimer: (r["Disclaimer"] || "").trim(),
    });
  }
  productsCache = out;
  productsByIdCache = new Map(out.map((p) => [p.id, p]));
  return out;
}

function loadRetailers(): Retailer[] {
  const rt = runtime();
  if (rt.sheetRetailers) return rt.sheetRetailers;
  if (retailersCache) return retailersCache;
  const raw = fs.readFileSync(RETAILERS_CSV, "utf8");
  const rows: Record<string, string>[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  const out: Retailer[] = rows.map((r) => ({
    id: `ret-${r.phone}`,
    phone: r.phone,
    name: r.name,
    shopName: r.shopName,
    distributorId: r.distributorId,
    salesTerritoryId: r.salesTerritoryId,
    avatarSeed: r.phone,
  }));
  retailersCache = out;
  return out;
}

function loadPincodes(): Map<string, Town> {
  if (pincodeCache) return pincodeCache;
  const raw = fs.readFileSync(PINCODES_CSV, "utf8");
  const rows: Record<string, string>[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  const m = new Map<string, Town>();
  for (const r of rows) {
    m.set(r.pincode, {
      pincode: r.pincode,
      state: r.state,
      district: r.district,
      subDistrict: r.subDistrict,
      locality: r.locality,
    });
  }
  pincodeCache = m;
  return m;
}

function loadSales(stId: string): Map<string, ProductSalesStat> {
  const rt = runtime();
  if (rt.sheetSales) {
    return rt.sheetSales.get(stId) ?? new Map();
  }
  const cached = salesCache.get(stId);
  if (cached) return cached;
  const file = salesCsvFor(stId);
  if (!fs.existsSync(file)) {
    const empty = new Map<string, ProductSalesStat>();
    salesCache.set(stId, empty);
    return empty;
  }
  const raw = fs.readFileSync(file, "utf8");
  const rows: Record<string, string>[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  const m = new Map<string, ProductSalesStat>();
  for (const r of rows) {
    m.set(r.productId, {
      productId: r.productId,
      salesRs: Number(r.salesRs) || 0,
      brRs: Number(r.brRs) || 0,
      repeatCount: Number(r.repeatCount) || 0,
    });
  }
  salesCache.set(stId, m);
  return m;
}

function loadPOGIfNeeded(): void {
  const rt = runtime();
  if (rt.pogLoaded) return;
  rt.pogLoaded = true;
  if (!fs.existsSync(POG_CSV)) return;
  const raw = fs.readFileSync(POG_CSV, "utf8");
  const rows: Record<string, string>[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  for (const r of rows) {
    const entry: POGEntry = {
      retailerId: r.retailerId,
      productId: r.productId,
      stId: r.stId,
      pogRs: Number(r.pogRs) || 0,
      updatedAt: Number(r.updatedAt) || 0,
    };
    const arr = rt.pogByST.get(entry.stId) || [];
    arr.push(entry);
    rt.pogByST.set(entry.stId, arr);
  }
}

// -------- Demo / sample teams --------

function buildSampleTeam(retailer: Retailer, products: Product[]): Team {
  const byCat: Record<CategoryId, Product[]> = {
    "spec-plant-nutrition": [],
    "crop-protection": [],
    "veg-seeds": [],
    "hybrid-seeds": [],
    "research-seeds": [],
  };
  for (const p of products) byCat[p.category].push(p);

  // Distribution totalling 11: cp=3, pn=2, veg=2, hybrid=2, research=2
  const plan: Record<CategoryId, number> = {
    "crop-protection": 3,
    "spec-plant-nutrition": 2,
    "veg-seeds": 2,
    "hybrid-seeds": 2,
    "research-seeds": 2,
  };

  const picked: { productId: string; category: CategoryId }[] = [];
  for (const cat of Object.keys(plan) as CategoryId[]) {
    const pool = byCat[cat];
    const n = Math.min(plan[cat], pool.length);
    const chosen = new Set<number>();
    let salt = 0;
    while (chosen.size < n && salt < 200) {
      const i = seededInt(`${retailer.id}:${cat}:${salt}`, 0, pool.length - 1);
      if (!chosen.has(i)) chosen.add(i);
      salt++;
    }
    for (const i of chosen) picked.push({ productId: pool[i].id, category: cat });
  }

  const capIdx = seededInt(`cap:${retailer.id}`, 0, picked.length - 1);
  let vcIdx = seededInt(`vc:${retailer.id}`, 0, picked.length - 1);
  if (vcIdx === capIdx) vcIdx = (vcIdx + 1) % picked.length;

  return {
    retailerId: retailer.id,
    picks: picked,
    captainId: picked[capIdx].productId,
    viceCaptainId: picked[vcIdx].productId,
    lockedAt: Date.now() - (hash(retailer.id) % 86400000),
  };
}

let sampleTeamsCache: Team[] | null = null;
function getSampleTeams(): Team[] {
  if (sampleTeamsCache) return sampleTeamsCache;
  const products = loadProducts();
  const retailers = loadRetailers();
  sampleTeamsCache = retailers.map((r) => buildSampleTeam(r, products));
  return sampleTeamsCache;
}

// -------- POG persistence --------

function csvField(v: string | number): string {
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function writePOGEntry(entry: POGEntry): void {
  const existed = fs.existsSync(POG_CSV);
  const line = [entry.retailerId, entry.productId, entry.stId, entry.pogRs, entry.updatedAt]
    .map(csvField)
    .join(",");
  if (!existed) {
    fs.writeFileSync(POG_CSV, "retailerId,productId,stId,pogRs,updatedAt\n" + line + "\n");
  } else {
    fs.appendFileSync(POG_CSV, line + "\n");
  }
}

// -------- Public repo API --------

export const repo = {
  // products / distributors / territories
  getProducts(): Product[] {
    return loadProducts();
  },
  getProductsById(): Map<string, Product> {
    loadProducts();
    return productsByIdCache!;
  },
  getDistributors(): Distributor[] {
    return DISTRIBUTORS;
  },
  getDistributor(id: string): Distributor | null {
    return DISTRIBUTORS.find((d) => d.id === id) ?? null;
  },
  getTerritories(): SalesTerritory[] {
    return TERRITORIES;
  },
  getTerritory(id: string): SalesTerritory | null {
    return TERRITORIES.find((t) => t.id === id) ?? null;
  },

  // retailers
  getRetailerByPhone(phone: string): Retailer | null {
    const rs = loadRetailers();
    const base = rs.find((r) => r.phone === phone) ?? null;
    if (!base) return null;
    const rt = runtime();
    return rt.retailerOverrides.get(base.id) ?? base;
  },
  getRetailerById(id: string): Retailer | null {
    const rs = loadRetailers();
    const rt = runtime();
    return rt.retailerOverrides.get(id) ?? rs.find((r) => r.id === id) ?? null;
  },
  setRetailerPincode(retailerId: string, pincode: string): void {
    runtime().pincodeByRetailer.set(retailerId, pincode);
  },
  getRetailerPincode(retailerId: string): string | null {
    return runtime().pincodeByRetailer.get(retailerId) ?? null;
  },

  // pincodes / towns
  getTownByPincode(pincode: string): Town | null {
    const m = loadPincodes();
    return m.get(pincode) ?? null;
  },

  // sales
  getSalesForST(stId: string): Map<string, ProductSalesStat> {
    return loadSales(stId);
  },

  // pog
  getPOGForST(stId: string): POGEntry[] {
    loadPOGIfNeeded();
    return runtime().pogByST.get(stId) ?? [];
  },
  // sum POG across retailers in ST, by productId
  getPOGTotalsForST(stId: string): Map<string, number> {
    const totals = new Map<string, number>();
    for (const e of this.getPOGForST(stId)) {
      totals.set(e.productId, (totals.get(e.productId) ?? 0) + e.pogRs);
    }
    return totals;
  },
  // sum POG for a specific retailer (for self-scoring)
  getPOGForRetailer(stId: string, retailerId: string): Map<string, number> {
    const m = new Map<string, number>();
    for (const e of this.getPOGForST(stId)) {
      if (e.retailerId !== retailerId) continue;
      m.set(e.productId, (m.get(e.productId) ?? 0) + e.pogRs);
    }
    return m;
  },
  appendPOG(
    stId: string,
    retailerId: string,
    productId: string,
    addRs: number,
  ): { ok: true } | { ok: false; reason: string } {
    if (!Number.isFinite(addRs) || addRs <= 0) {
      return { ok: false, reason: "Amount must be greater than ₹0." };
    }
    if (addRs > 10_000_000) {
      return { ok: false, reason: "Amount looks too large. Please re-check." };
    }
    const sales = loadSales(stId);
    const stat = sales.get(productId);
    if (!stat) {
      return { ok: false, reason: "Product not sold in your territory yet." };
    }
    const totals = this.getPOGTotalsForST(stId);
    const currentCombined = totals.get(productId) ?? 0;
    if (currentCombined + addRs > stat.salesRs) {
      const remaining = Math.max(0, stat.salesRs - currentCombined);
      return {
        ok: false,
        reason: `Combined POG across retailers (₹${currentCombined.toLocaleString("en-IN")}) plus this entry would exceed territory sales (₹${stat.salesRs.toLocaleString("en-IN")}). Remaining headroom: ₹${remaining.toLocaleString("en-IN")}.`,
      };
    }
    const entry: POGEntry = {
      retailerId,
      productId,
      stId,
      pogRs: addRs,
      updatedAt: Date.now(),
    };
    loadPOGIfNeeded();
    const arr = runtime().pogByST.get(stId) ?? [];
    arr.push(entry);
    runtime().pogByST.set(stId, arr);
    writePOGEntry(entry);
    return { ok: true };
  },

  // teams
  saveTeam(team: Team): Team {
    const saved = { ...team, lockedAt: Date.now() };
    runtime().teams.set(team.retailerId, saved);
    return saved;
  },
  getTeam(retailerId: string): Team | null {
    const rt = runtime();
    if (rt.teams.has(retailerId)) return rt.teams.get(retailerId)!;
    return getSampleTeams().find((t) => t.retailerId === retailerId) ?? null;
  },
  // Only returns a team the user has explicitly locked in this session
  getSavedTeam(retailerId: string): Team | null {
    return runtime().teams.get(retailerId) ?? null;
  },
  listTeamsForST(stId: string): Team[] {
    const retailers = loadRetailers();
    const distributorIds = new Set(
      DISTRIBUTORS.filter((d) => d.salesTerritoryId === stId).map((d) => d.id),
    );
    const stRetailerIds = new Set(
      retailers.filter((r) => distributorIds.has(r.distributorId)).map((r) => r.id),
    );
    const rt = runtime();
    const teams: Team[] = [];
    for (const t of getSampleTeams()) {
      if (stRetailerIds.has(t.retailerId)) teams.push(t);
    }
    // Override with any saved teams for these retailers
    for (const [rid, team] of rt.teams.entries()) {
      const r = this.getRetailerById(rid);
      if (!r) continue;
      if (!stRetailerIds.has(r.id)) continue;
      const idx = teams.findIndex((x) => x.retailerId === rid);
      if (idx >= 0) teams[idx] = team;
      else teams.push(team);
    }
    return teams;
  },
};
