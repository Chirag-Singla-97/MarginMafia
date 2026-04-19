import { NextResponse } from "next/server";
import { clearCurrentRetailer } from "@/lib/session";

export async function POST() {
  clearCurrentRetailer();
  return NextResponse.json({ ok: true });
}
