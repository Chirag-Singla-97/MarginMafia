import { NextResponse } from "next/server";
import { ensureSheetsWarm, repo } from "@/lib/data/repo";
import { getCurrentRetailer } from "@/lib/session";
import { scoreTeam } from "@/lib/scoring";
import type { LeaderboardRow } from "@/lib/types";

export async function GET(req: Request) {
  await ensureSheetsWarm();
  const url = new URL(req.url);
  const stId = url.searchParams.get("stId");
  if (!stId) return NextResponse.json({ error: "stId required" }, { status: 400 });

  const me = getCurrentRetailer();
  const productsById = repo.getProductsById();
  const sales = repo.getSalesForST(stId);

  const teams = repo.listTeamsForST(stId);
  const rows: LeaderboardRow[] = [];
  for (const team of teams) {
    const retailer = repo.getRetailerById(team.retailerId);
    if (!retailer) continue;
    const pogForHim = repo.getPOGForRetailer(stId, retailer.id);
    const score = scoreTeam(team, productsById, sales, pogForHim);
    rows.push({
      retailerId: retailer.id,
      name: retailer.name,
      shopName: retailer.shopName,
      avatarSeed: retailer.avatarSeed,
      totalPoints: Math.round(score.total),
      rank: 0,
      isYou: me?.id === retailer.id,
    });
  }

  rows.sort((a, b) => b.totalPoints - a.totalPoints);
  rows.forEach((r, i) => (r.rank = i + 1));

  return NextResponse.json({ rows });
}
