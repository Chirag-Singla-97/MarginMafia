import { NextResponse } from "next/server";
import { ensureSheetsWarm, repo } from "@/lib/data/repo";
import { setCurrentRetailerId } from "@/lib/session";

export async function POST(req: Request) {
  await ensureSheetsWarm();
  const body = await req.json().catch(() => ({}));
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const pincode = typeof body.pincode === "string" ? body.pincode.trim() : "";

  if (!/^\d{10}$/.test(phone)) {
    return NextResponse.json(
      { error: "Please enter a valid 10-digit phone number." },
      { status: 400 },
    );
  }
  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json(
      { error: "Please enter a valid 6-digit pincode." },
      { status: 400 },
    );
  }

  const retailer = repo.getRetailerByPhone(phone);
  if (!retailer) {
    return NextResponse.json(
      {
        registered: false,
        error:
          "This number isn't registered as a retailer yet. Please onboard on the company platform first, then come back.",
      },
      { status: 404 },
    );
  }

  const town = repo.getTownByPincode(pincode);
  repo.setRetailerPincode(retailer.id, pincode);
  setCurrentRetailerId(retailer.id);

  const distributor = repo.getDistributor(retailer.distributorId);
  const territory = repo.getTerritory(retailer.salesTerritoryId);

  return NextResponse.json({
    registered: true,
    retailer,
    distributor,
    territory,
    town, // may be null if pincode not found — UI handles
  });
}
