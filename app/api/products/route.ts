import { NextResponse } from "next/server";
import { repo } from "@/lib/data/repo";

export async function GET() {
  return NextResponse.json({ products: repo.getProducts() });
}
