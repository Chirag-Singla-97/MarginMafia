import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import type {
  CategoryId,
  Distributor,
  Product,
  Retailer,
  SalesTerritory,
  Team,
} from "@/lib/types";
import { computeBasePoints, computeSaleVelocity } from "@/lib/scoring";
import { hash, seededInt } from "@/lib/utils";

function mapCategory(raw: string): CategoryId | null {
  const s = raw.trim().toLowerCase();
  if (s.startsWith("plant nutrition")) return "plant-nutrition";
  if (s.startsWith("crop protection")) return "crop-protection";
  if (s.startsWith("seeds")) return "seeds";
  return null;
}

function splitBullets(s: string): string[] {
  if (!s) return [];
  return s
    .split(/\r?\n|•|·|;/)
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
}

export interface SeedData {
  products: Product[];
  productsById: Map<string, Product>;
  territories: SalesTerritory[];
  distributors: Distributor[];
  retailers: Retailer[];
  sampleTeams: Team[];
}

let cache: SeedData | null = null;

export function getSeedData(): SeedData {
  if (cache) return cache;
  cache = buildSeed();
  return cache;
}

function buildSeed(): SeedData {
  const csvPath = path.join(process.cwd(), "lib", "data", "products.csv");
  const raw = fs.readFileSync(csvPath, "utf8");
  const rows: Record<string, string>[] = parse(raw, {
    columns: true,
    relax_quotes: true,
    relax_column_count: true,
    skip_empty_lines: true,
    trim: true,
  });

  const products: Product[] = [];
  const seenIds = new Set<string>();

  for (const r of rows) {
    const name = (r["Product Name"] || "").trim();
    const status = (r["Status*"] || r["Status"] || "").trim();
    if (!name) continue;
    if (status && status.toLowerCase() !== "active") continue;

    const category = mapCategory(r["Category"] || "");
    if (!category) continue;

    const uniqueId = (r["Product Unique ID*"] || r["Product Unique ID"] || "").trim();
    const sku = (r["SKU"] || "").trim();
    const id = (uniqueId || `${name}-${sku || products.length}`).replace(/\s+/g, "-").toLowerCase();
    if (seenIds.has(id)) continue;
    seenIds.add(id);

    const comp = (r["Techncal composition"] || r["Technical composition"] || "").trim();
    const cropTarget = (r["Crop/Target Crop"] || "").trim();
    const shortDesc = (r["1 lineShort Description"] || r["1 line Short Description"] || "").trim();
    const uspRaw = (r["USP's (For CCC, Include mode of action here)"] || r["USPs"] || "").trim();

    const product: Product = {
      id,
      name,
      category,
      subCategory: (r["Sub-category"] || "").trim(),
      composition: comp,
      sku,
      cropTarget,
      shortDesc,
      usp: splitBullets(uspRaw),
      dosage: (r["Dosage"] || "").trim(),
      applicationMethod: (r["Method of application"] || "").trim(),
      applicationTime: (r["Time of sowing /Time of application"] || r["Time of application"] || "").trim(),
      season: (r["Season"] || "").trim(),
      geographies: (r["Geographies"] || "").trim(),
      disclaimer: (r["Disclaimer"] || "").trim(),
      basePoints: computeBasePoints(id),
      saleVelocity: computeSaleVelocity(id),
    };
    products.push(product);
  }

  const productsById = new Map(products.map((p) => [p.id, p]));

  const territories: SalesTerritory[] = [
    { id: "st-north", name: "North Zone", region: "Punjab · Haryana · UP" },
    { id: "st-west", name: "West Zone", region: "Maharashtra · Gujarat · MP" },
    { id: "st-south", name: "South Zone", region: "Karnataka · Andhra · Telangana" },
  ];

  const distributors: Distributor[] = [
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

  const retailerNames = [
    ["Rajesh Kumar", "Kumar Beej Bhandar"],
    ["Suresh Patel", "Patel Agro Store"],
    ["Manoj Sharma", "Sharma Krishi Seva"],
    ["Amit Yadav", "Yadav Kisan Kendra"],
    ["Vikram Singh", "Singh Fasal Mitra"],
    ["Deepak Gupta", "Gupta Agri Store"],
    ["Ravi Verma", "Verma Khaad Bhandar"],
    ["Sanjay Mehta", "Mehta Agri Traders"],
    ["Anil Joshi", "Joshi Krishi Kendra"],
    ["Prakash Rao", "Rao Seeds & Pesticides"],
    ["Mahesh Nair", "Nair Agro Shoppe"],
    ["Rakesh Reddy", "Reddy Kisan Seva"],
    ["Harish Iyer", "Iyer Farm Store"],
    ["Dinesh Shetty", "Shetty Agro Hub"],
    ["Ramesh Gowda", "Gowda Krishi Bhandar"],
    ["Bharat Desai", "Desai Agri Supplies"],
    ["Kiran Pawar", "Pawar Kisan Store"],
    ["Sachin More", "More Beej Kendra"],
    ["Mahendra Jadhav", "Jadhav Agri Mitra"],
    ["Nikhil Kulkarni", "Kulkarni Farm Store"],
    ["Arjun Malik", "Malik Agri Bhandar"],
    ["Rohit Chauhan", "Chauhan Krishi Kendra"],
    ["Vinod Bhatia", "Bhatia Seeds Corner"],
    ["Karan Saini", "Saini Agri Stop"],
    ["Gopal Tiwari", "Tiwari Khaad Ghar"],
    ["Naresh Dubey", "Dubey Kisan Bhandar"],
    ["Pramod Mishra", "Mishra Agri Store"],
  ];

  const retailers: Retailer[] = [];
  let idx = 0;
  for (const d of distributors) {
    const perDist = 3;
    for (let j = 0; j < perDist; j++) {
      const [name, shop] = retailerNames[idx % retailerNames.length];
      retailers.push({
        id: `ret-sample-${idx + 1}`,
        name,
        shopName: shop,
        distributorId: d.id,
        avatarSeed: `seed-${idx + 1}`,
      });
      idx++;
    }
  }

  const sampleTeams: Team[] = retailers.map((r) => buildRandomTeam(r.id, products));

  return { products, productsById, territories, distributors, retailers, sampleTeams };
}

function buildRandomTeam(retailerId: string, products: Product[]): Team {
  const pn = products.filter((p) => p.category === "plant-nutrition");
  const cp = products.filter((p) => p.category === "crop-protection");
  const sd = products.filter((p) => p.category === "seeds");

  const pick = (pool: Product[], count: number, seed: string): Product[] => {
    if (pool.length === 0) return [];
    const indices = new Set<number>();
    const out: Product[] = [];
    let salt = 0;
    while (out.length < count && out.length < pool.length && salt < 100) {
      const i = seededInt(`${seed}:${salt}`, 0, pool.length - 1);
      if (!indices.has(i)) {
        indices.add(i);
        out.push(pool[i]);
      }
      salt++;
    }
    return out;
  };

  const nPN = seededInt(`pn:${retailerId}`, 1, 3);
  const nCP = seededInt(`cp:${retailerId}`, 1, 3);
  const nSD = seededInt(`sd:${retailerId}`, 1, 3);

  const picked = [
    ...pick(pn, nPN, `${retailerId}:pn`),
    ...pick(cp, nCP, `${retailerId}:cp`),
    ...pick(sd, nSD, `${retailerId}:sd`),
  ];

  const picksArr = picked.map((p) => ({ productId: p.id, category: p.category }));
  const capIdx = seededInt(`cap:${retailerId}`, 0, picked.length - 1);
  let vcIdx = seededInt(`vc:${retailerId}`, 0, picked.length - 1);
  if (vcIdx === capIdx) vcIdx = (vcIdx + 1) % picked.length;

  return {
    retailerId,
    picks: picksArr,
    captainId: picked[capIdx].id,
    viceCaptainId: picked[vcIdx].id,
    lockedAt: Date.now() - (hash(retailerId) % 86400000),
  };
}
