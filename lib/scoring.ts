import type { POGEntry, Product, ProductSalesStat, Team } from "./types";

export const CURRENT_MONTH_ID = "2026-04";

export const POINTS_PER_100_SALES = 10;
export const POINTS_PER_100_BR = 15;
export const POINTS_PER_REPEAT = 5;
export const POINTS_PER_100_POG = 20;

export interface ScoreBreakdown {
  productId: string;
  isCaptain: boolean;
  isViceCaptain: boolean;
  multiplier: number;
  salesRs: number;
  brRs: number;
  repeatCount: number;
  pogRs: number;
  salesPts: number;
  brPts: number;
  repeatPts: number;
  pogPts: number;
  rawPts: number;
  finalPoints: number;
}

export interface TeamScore {
  total: number;
  breakdown: ScoreBreakdown[];
}

export function productRawScore(
  stat: ProductSalesStat | undefined,
  retailerPogRs: number,
): { salesPts: number; brPts: number; repeatPts: number; pogPts: number; raw: number } {
  const salesRs = stat?.salesRs ?? 0;
  const brRs = stat?.brRs ?? 0;
  const repeat = stat?.repeatCount ?? 0;
  const salesPts = Math.floor(salesRs / 100) * POINTS_PER_100_SALES;
  const brPts = Math.floor(brRs / 100) * POINTS_PER_100_BR;
  const repeatPts = repeat * POINTS_PER_REPEAT;
  const pogPts = Math.floor((retailerPogRs || 0) / 100) * POINTS_PER_100_POG;
  return { salesPts, brPts, repeatPts, pogPts, raw: salesPts + brPts + repeatPts + pogPts };
}

export function scoreTeam(
  team: Team,
  productsById: Map<string, Product>,
  salesByProduct: Map<string, ProductSalesStat>,
  pogForRetailer: Map<string, number>,
): TeamScore {
  const breakdown: ScoreBreakdown[] = team.picks.map((pick) => {
    const p = productsById.get(pick.productId);
    const stat = salesByProduct.get(pick.productId);
    const pogRs = pogForRetailer.get(pick.productId) ?? 0;
    const isC = pick.productId === team.captainId;
    const isVC = pick.productId === team.viceCaptainId;
    const multiplier = isC ? 2 : isVC ? 1.5 : 1;
    const { salesPts, brPts, repeatPts, pogPts, raw } = productRawScore(stat, pogRs);
    return {
      productId: pick.productId,
      isCaptain: isC,
      isViceCaptain: isVC,
      multiplier,
      salesRs: stat?.salesRs ?? 0,
      brRs: stat?.brRs ?? 0,
      repeatCount: stat?.repeatCount ?? 0,
      pogRs,
      salesPts,
      brPts,
      repeatPts,
      pogPts,
      rawPts: raw,
      finalPoints: raw * multiplier,
      ...(p ? {} : {}),
    };
  });
  const total = breakdown.reduce((acc, b) => acc + b.finalPoints, 0);
  return { total, breakdown };
}
