// One-time extraction: xlsx (~26MB) -> lib/data/pincodes.csv
// Run: npx ts-node --transpile-only scripts/build-pincodes.ts
// Or:  node -r ./scripts/tsnode-shim.js scripts/build-pincodes.ts   (not used)
//
// Simplest path: run as plain Node after compiling by hand, or just use
// `node --experimental-strip-types scripts/build-pincodes.ts` on Node 22+.
//
// Because we want zero friction, we keep the logic in plain JS below.
import XLSX from "xlsx";
import fs from "node:fs";
import path from "node:path";

const SRC = "/home/chirag-singla/Self/Locality_village_pincode_final_mar-2017 (2).xlsx";
const OUT = path.join(process.cwd(), "lib", "data", "pincodes.csv");

const wb = XLSX.readFile(SRC, { cellDates: false });
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json<any>(sheet, { raw: true });

// Aggregate to one row per pincode (first locality wins)
const byPin = new Map<string, { state: string; district: string; subDistrict: string; locality: string }>();
for (const r of rows) {
  const pin = String(r["Pincode"] ?? "").trim();
  if (!/^\d{6}$/.test(pin)) continue;
  if (byPin.has(pin)) continue;
  byPin.set(pin, {
    state: String(r["StateName"] ?? "").trim(),
    district: String(r["Districtname"] ?? "").trim(),
    subDistrict: String(r["Sub-distname"] ?? "").trim(),
    locality: String(r["Village/Locality name"] ?? "").trim(),
  });
}

function csvField(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

const lines = ["pincode,state,district,subDistrict,locality"];
for (const [pin, v] of Array.from(byPin.entries()).sort()) {
  lines.push([pin, v.state, v.district, v.subDistrict, v.locality].map(csvField).join(","));
}
fs.writeFileSync(OUT, lines.join("\n") + "\n");
console.log(`Wrote ${byPin.size} unique pincodes -> ${OUT}`);
