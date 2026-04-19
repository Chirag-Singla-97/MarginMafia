import { NextResponse } from "next/server";
import { getCurrentRetailer, markConfirmed } from "@/lib/session";

export async function POST() {
  const retailer = getCurrentRetailer();
  if (!retailer) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  markConfirmed();
  return NextResponse.json({ ok: true });
}
