import { NextResponse } from "next/server";
import { getCurrentRetailer, isConfirmed } from "@/lib/session";
import { ensureSheetsWarm, repo } from "@/lib/data/repo";

export async function GET() {
  await ensureSheetsWarm();
  const retailer = getCurrentRetailer();
  if (!retailer) return NextResponse.json({ retailer: null });

  const distributor = repo.getDistributor(retailer.distributorId);
  const territory = repo.getTerritory(retailer.salesTerritoryId);
  const pincode = repo.getRetailerPincode(retailer.id);
  const town = pincode ? repo.getTownByPincode(pincode) : null;
  const team = repo.getSavedTeam(retailer.id);
  const confirmed = isConfirmed();

  return NextResponse.json({
    retailer,
    distributor,
    territory,
    town,
    pincode,
    confirmed,
    team,
  });
}
