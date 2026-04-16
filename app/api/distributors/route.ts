import { NextResponse } from "next/server";
import { getSeedData } from "@/lib/data/seed";

export async function GET() {
  const { distributors, territories } = getSeedData();
  const territoryById = new Map(territories.map((t) => [t.id, t]));
  const enriched = distributors.map((d) => ({
    ...d,
    territory: territoryById.get(d.salesTerritoryId) ?? null,
  }));
  return NextResponse.json({ distributors: enriched, territories });
}
