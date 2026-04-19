export type CategoryId =
  | "spec-plant-nutrition"
  | "crop-protection"
  | "veg-seeds"
  | "hybrid-seeds"
  | "research-seeds";

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
  accent: string;
}

export const CATEGORIES: Category[] = [
  { id: "spec-plant-nutrition", name: "Speciality Plant Nutrition", emoji: "🌱", accent: "field" },
  { id: "crop-protection", name: "Crop Protection", emoji: "🛡️", accent: "brand" },
  { id: "veg-seeds", name: "Vegetable Seeds", emoji: "🥦", accent: "soil" },
  { id: "hybrid-seeds", name: "Hybrid Seeds", emoji: "🌾", accent: "amber" },
  { id: "research-seeds", name: "Research Seeds", emoji: "🔬", accent: "slate" },
];

export const CATEGORY_ACCENTS: Record<CategoryId, { chip: string; hero: string; bar: string }> = {
  "spec-plant-nutrition": {
    chip: "chip-field",
    hero: "from-field-500 to-field-700",
    bar: "bg-gradient-to-r from-field-400 to-field-600",
  },
  "crop-protection": {
    chip: "chip-brand",
    hero: "from-brand-500 to-brand-700",
    bar: "bg-gradient-to-r from-brand-400 to-brand-600",
  },
  "veg-seeds": {
    chip: "chip-dark",
    hero: "from-ink-700 to-ink-900",
    bar: "bg-gradient-to-r from-ink-600 to-ink-900",
  },
  "hybrid-seeds": {
    chip: "chip-gold",
    hero: "from-amber-500 to-amber-700",
    bar: "bg-gradient-to-r from-amber-400 to-amber-600",
  },
  "research-seeds": {
    chip: "chip-silver",
    hero: "from-slate-500 to-slate-700",
    bar: "bg-gradient-to-r from-slate-400 to-slate-600",
  },
};

export interface SalesTerritory {
  id: string;
  name: string;
  region: string;
}

export interface Distributor {
  id: string;
  name: string;
  salesTerritoryId: string;
  city: string;
}

export interface Retailer {
  id: string;
  phone: string;
  name: string;
  shopName: string;
  distributorId: string;
  salesTerritoryId: string;
  avatarSeed: string;
}

export interface Town {
  pincode: string;
  state: string;
  district: string;
  subDistrict: string;
  locality: string;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  subCategory: string;
  composition: string;
  sku: string;
  cropTarget: string;
  shortDesc: string;
  usp: string[];
  dosage: string;
  applicationMethod: string;
  applicationTime: string;
  season: string;
  geographies: string;
  disclaimer: string;
}

export interface ProductPick {
  productId: string;
  category: CategoryId;
}

export interface Team {
  retailerId: string;
  picks: ProductPick[];
  captainId: string;
  viceCaptainId: string;
  lockedAt?: number;
}

export interface LeaderboardRow {
  retailerId: string;
  name: string;
  shopName: string;
  avatarSeed: string;
  totalPoints: number;
  rank: number;
  isYou: boolean;
}

export interface ProductSalesStat {
  productId: string;
  salesRs: number;
  brRs: number;
  repeatCount: number;
}

export interface POGEntry {
  retailerId: string;
  productId: string;
  stId: string;
  pogRs: number;
  updatedAt: number;
}
