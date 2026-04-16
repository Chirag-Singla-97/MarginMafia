export type CategoryId = "plant-nutrition" | "crop-protection" | "seeds";

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
  accent: string;
}

export const CATEGORIES: Category[] = [
  { id: "plant-nutrition", name: "Plant Nutrition", emoji: "🌱", accent: "field" },
  { id: "crop-protection", name: "Crop Protection", emoji: "🛡️", accent: "brand" },
  { id: "seeds", name: "Seeds", emoji: "🌾", accent: "soil" },
];

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
  name: string;
  distributorId: string;
  avatarSeed: string;
  shopName: string;
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
  basePoints: number;
  saleVelocity: number;
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
