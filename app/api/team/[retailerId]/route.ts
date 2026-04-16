import { NextResponse } from "next/server";
import { getTeam } from "@/lib/data/store";
import { getSeedData } from "@/lib/data/seed";
import { scoreTeam } from "@/lib/scoring";

export async function GET(_req: Request, { params }: { params: { retailerId: string } }) {
  const team = getTeam(params.retailerId);
  if (!team) return NextResponse.json({ team: null });
  const { productsById, retailers } = getSeedData();
  const retailer = retailers.find((r) => r.id === params.retailerId) || null;
  const score = scoreTeam(team, productsById);
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
