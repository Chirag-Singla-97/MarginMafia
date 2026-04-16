import { NextResponse } from "next/server";
import { getSeedData } from "@/lib/data/seed";

export async function GET() {
  const { products } = getSeedData();
  return NextResponse.json({ products });
}
