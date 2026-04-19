import { cookies } from "next/headers";
import type { Retailer } from "@/lib/types";
import { repo } from "@/lib/data/repo";

const COOKIE_NAME = "mm_user";
const CONFIRMED_COOKIE = "mm_confirmed";

export function getCurrentRetailerId(): string | null {
  return cookies().get(COOKIE_NAME)?.value || null;
}

export function setCurrentRetailerId(id: string) {
  cookies().set(COOKIE_NAME, id, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
}

export function clearCurrentRetailer() {
  cookies().delete(COOKIE_NAME);
  cookies().delete(CONFIRMED_COOKIE);
}

export function getCurrentRetailer(): Retailer | null {
  const id = getCurrentRetailerId();
  if (!id) return null;
  return repo.getRetailerById(id);
}

export function markConfirmed() {
  cookies().set(CONFIRMED_COOKIE, "1", { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
}

export function isConfirmed(): boolean {
  return cookies().get(CONFIRMED_COOKIE)?.value === "1";
}
