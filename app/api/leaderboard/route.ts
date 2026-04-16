import { NextResponse } from "next/server";
import { getSeedData } from "@/lib/data/seed";
import { listAllTeamsForST, getRetailer, getTeam } from "@/lib/data/store";
import { getCurrentRetailer } from "@/lib/session";
import { scoreTeam } from "@/lib/scoring";
import type { LeaderboardRow } from "@/lib/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const stId = url.searchParams.get("stId");
  if (!stId) return NextResponse.json({ error: "stId required" }, { status: 400 });

  const me = getCurrentRetailer();
  const { productsById } = getSeedData();

  const teams = listAllTeamsForST(stId);

  const rows: LeaderboardRow[] = [];
  for (const team of teams) {
    const retailer = getRetailer(team.retailerId);
    if (!retailer) continue;
    const score = scoreTeam(team, productsById);
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

  if (me && me.distributorId) {
    const { distributors } = getSeedData();
    const myDist = distributors.find((d) => d.id === me.distributorId);
    if (myDist && myDist.salesTerritoryId === stId && !rows.some((r) => r.retailerId === me.id)) {
      const myTeam = getTeam(me.id);
      if (myTeam) {
        const score = scoreTeam(myTeam, productsById);
        rows.push({
          retailerId: me.id,
          name: me.name,
          shopName: me.shopName,
          avatarSeed: me.avatarSeed,
          totalPoints: Math.round(score.total),
          rank: 0,
          isYou: true,
        });
      }
    }
  }

  rows.sort((a, b) => b.totalPoints - a.totalPoints);
  rows.forEach((r, i) => (r.rank = i + 1));

  return NextResponse.json({ rows });
}
