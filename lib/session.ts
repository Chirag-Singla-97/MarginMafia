import { cookies } from "next/headers";
import type { Retailer } from "@/lib/types";
import { getRetailer, registerRetailer } from "@/lib/data/store";

const COOKIE_NAME = "mm_user";

export function getCurrentRetailerId(): string | null {
  const store = cookies();
  const v = store.get(COOKIE_NAME)?.value;
  return v || null;
}

export function setCurrentRetailerId(id: string) {
  const store = cookies();
  store.set(COOKIE_NAME, id, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
}

export function clearCurrentRetailer() {
  const store = cookies();
  store.delete(COOKIE_NAME);
}

export function createRetailerFromLogin(name: string, shopName?: string): Retailer {
  const id = "ret-you-" + Date.now().toString(36);
  const retailer: Retailer = {
    id,
    name,
    shopName: shopName || `${name.split(" ")[0]}'s Store`,
    distributorId: "",
    avatarSeed: id,
  };
  registerRetailer(retailer);
  setCurrentRetailerId(id);
  return retailer;
}

export function getCurrentRetailer(): Retailer | null {
  const id = getCurrentRetailerId();
  if (!id) return null;
  return getRetailer(id) ?? null;
}
