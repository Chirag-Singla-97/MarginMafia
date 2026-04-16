import { NextResponse } from "next/server";
import { createRetailerFromLogin } from "@/lib/session";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const shopName = typeof body.shopName === "string" ? body.shopName.trim() : "";
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const retailer = createRetailerFromLogin(name, shopName);
  return NextResponse.json({ retailer });
}
