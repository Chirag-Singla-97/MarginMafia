import { CATEGORIES, type CategoryId, type ProductPick } from "./types";

export const MIN_PER_CATEGORY = 1;
export const MAX_PER_CATEGORY = 3;

export interface DraftTeam {
  picks: ProductPick[];
  captainId: string | null;
  viceCaptainId: string | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function countByCategory(picks: ProductPick[]): Record<CategoryId, number> {
  const counts = { "plant-nutrition": 0, "crop-protection": 0, "seeds": 0 } as Record<CategoryId, number>;
  for (const p of picks) counts[p.category]++;
  return counts;
}

export function validateTeam(draft: DraftTeam): ValidationResult {
  const errors: string[] = [];
  const counts = countByCategory(draft.picks);

  for (const cat of CATEGORIES) {
    const n = counts[cat.id];
    if (n < MIN_PER_CATEGORY) errors.push(`Pick at least ${MIN_PER_CATEGORY} product from ${cat.name}.`);
    if (n > MAX_PER_CATEGORY) errors.push(`At most ${MAX_PER_CATEGORY} products allowed from ${cat.name}.`);
  }

  if (!draft.captainId) errors.push("Pick a Captain (2× points).");
  if (!draft.viceCaptainId) errors.push("Pick a Vice-Captain (1.5× points).");

  if (draft.captainId && draft.viceCaptainId && draft.captainId === draft.viceCaptainId) {
    errors.push("Captain and Vice-Captain must be different products.");
  }

  if (draft.captainId && !draft.picks.some((p) => p.productId === draft.captainId)) {
    errors.push("Captain must be one of your picks.");
  }
  if (draft.viceCaptainId && !draft.picks.some((p) => p.productId === draft.viceCaptainId)) {
    errors.push("Vice-Captain must be one of your picks.");
  }

  return { valid: errors.length === 0, errors };
}

export function canAdd(picks: ProductPick[], category: CategoryId): boolean {
  return countByCategory(picks)[category] < MAX_PER_CATEGORY;
}
