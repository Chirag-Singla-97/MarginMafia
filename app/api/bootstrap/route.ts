import { NextResponse } from "next/server";
import { getCurrentRetailer } from "@/lib/session";
import { getSeedData } from "@/lib/data/seed";
import { getTeam } from "@/lib/data/store";

export async function GET() {
  const retailer = getCurrentRetailer();
  if (!retailer) return NextResponse.json({ retailer: null });
  const { distributors, territories } = getSeedData();
  const distributor = distributors.find((d) => d.id === retailer.distributorId) || null;
  const territory = distributor ? territories.find((t) => t.id === distributor.salesTerritoryId) || null : null;
  const team = getTeam(retailer.id) || null;
  return NextResponse.json({ retailer, distributor, territory, team });
}
