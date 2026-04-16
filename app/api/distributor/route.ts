import { NextResponse } from "next/server";
import { getCurrentRetailerId } from "@/lib/session";
import { updateRetailerDistributor } from "@/lib/data/store";
import { getSeedData } from "@/lib/data/seed";

export async function POST(req: Request) {
  const id = getCurrentRetailerId();
  if (!id) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const { distributorId } = await req.json().catch(() => ({}));
  if (!distributorId) return NextResponse.json({ error: "distributorId required" }, { status: 400 });
  const { distributors, territories } = getSeedData();
  const dist = distributors.find((d) => d.id === distributorId);
  if (!dist) return NextResponse.json({ error: "Unknown distributor" }, { status: 400 });
  const retailer = updateRetailerDistributor(id, distributorId);
  const territory = territories.find((t) => t.id === dist.salesTerritoryId) || null;
  return NextResponse.json({ retailer, distributor: dist, territory });
}
