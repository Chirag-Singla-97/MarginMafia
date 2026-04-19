import { NextResponse } from "next/server";
import { ensureSheetsWarm, repo } from "@/lib/data/repo";
import { scoreTeam } from "@/lib/scoring";

export async function GET(_req: Request, { params }: { params: { retailerId: string } }) {
  await ensureSheetsWarm();
  const team = repo.getTeam(params.retailerId);
  if (!team) return NextResponse.json({ team: null });
  const retailer = repo.getRetailerById(params.retailerId);
  if (!retailer) return NextResponse.json({ team: null });

  const productsById = repo.getProductsById();
  const sales = repo.getSalesForST(retailer.salesTerritoryId);
  const pogForMe = repo.getPOGForRetailer(retailer.salesTerritoryId, retailer.id);
  const score = scoreTeam(team, productsById, sales, pogForMe);

  return NextResponse.json({
    team,
    retailer,
    score,
    picks: team.picks.map((p) => ({
      ...p,
      product: productsById.get(p.productId) ?? null,
    })),
  });
}
