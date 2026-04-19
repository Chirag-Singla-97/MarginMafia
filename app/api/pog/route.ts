import { NextResponse } from "next/server";
import { getCurrentRetailer } from "@/lib/session";
import { ensureSheetsWarm, repo } from "@/lib/data/repo";

export async function GET() {
  await ensureSheetsWarm();
  const me = getCurrentRetailer();
  if (!me) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const team = repo.getSavedTeam(me.id);
  if (!team) return NextResponse.json({ error: "No team yet" }, { status: 400 });

  const productsById = repo.getProductsById();
  const sales = repo.getSalesForST(me.salesTerritoryId);
  const pogTotals = repo.getPOGTotalsForST(me.salesTerritoryId);
  const myPog = repo.getPOGForRetailer(me.salesTerritoryId, me.id);

  const items = team.picks.map((pick) => {
    const product = productsById.get(pick.productId) ?? null;
    const stat = sales.get(pick.productId);
    const salesRs = stat?.salesRs ?? 0;
    const combinedPog = pogTotals.get(pick.productId) ?? 0;
    const mine = myPog.get(pick.productId) ?? 0;
    return {
      productId: pick.productId,
      category: pick.category,
      product,
      salesRs,
      combinedPogRs: combinedPog,
      remainingRs: Math.max(0, salesRs - combinedPog),
      myPogRs: mine,
    };
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  await ensureSheetsWarm();
  const me = getCurrentRetailer();
  if (!me) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const productId = typeof body.productId === "string" ? body.productId : "";
  const addRs = Number(body.addRs);
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
  if (!Number.isFinite(addRs) || addRs <= 0) {
    return NextResponse.json({ error: "Amount must be greater than ₹0." }, { status: 400 });
  }

  const team = repo.getSavedTeam(me.id);
  if (!team || !team.picks.some((p) => p.productId === productId)) {
    return NextResponse.json({ error: "Product is not in your team." }, { status: 400 });
  }

  const res = repo.appendPOG(me.salesTerritoryId, me.id, productId, Math.round(addRs));
  if (!res.ok) {
    return NextResponse.json({ error: res.reason }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
