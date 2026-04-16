import { seededFloat, seededInt } from "./utils";
import type { Product, Team } from "./types";

export const CURRENT_MONTH_ID = "2026-04";

export function computeBasePoints(productId: string): number {
  return seededInt(`base:${productId}`, 20, 100);
}

export function computeSaleVelocity(productId: string): number {
  return seededFloat(`velocity:${productId}`, 0.5, 2.0);
}

export function monthlyBump(productId: string, monthId: string): number {
  return seededFloat(`bump:${productId}:${monthId}`, 0.75, 1.35);
}

export function productMonthPoints(product: Product, monthId = CURRENT_MONTH_ID): number {
  return product.basePoints * product.saleVelocity * monthlyBump(product.id, monthId);
}

export interface TeamScore {
  total: number;
  breakdown: {
    productId: string;
    basePoints: number;
    isCaptain: boolean;
    isViceCaptain: boolean;
    finalPoints: number;
  }[];
}

export function scoreTeam(team: Team, productsById: Map<string, Product>, monthId = CURRENT_MONTH_ID): TeamScore {
  const breakdown = team.picks.map((pick) => {
    const p = productsById.get(pick.productId);
    if (!p) {
      return { productId: pick.productId, basePoints: 0, isCaptain: false, isViceCaptain: false, finalPoints: 0 };
    }
    const base = productMonthPoints(p, monthId);
    const isC = p.id === team.captainId;
    const isVC = p.id === team.viceCaptainId;
    const multiplier = isC ? 2 : isVC ? 1.5 : 1;
    return {
      productId: p.id,
      basePoints: base,
      isCaptain: isC,
      isViceCaptain: isVC,
      finalPoints: base * multiplier,
    };
  });
  const total = breakdown.reduce((acc, b) => acc + b.finalPoints, 0);
  return { total, breakdown };
}
