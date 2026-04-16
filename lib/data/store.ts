import type { Retailer, Team } from "@/lib/types";
import { getSeedData } from "./seed";

interface UserRetailersStore {
  retailers: Map<string, Retailer>;
  teams: Map<string, Team>;
}

const globalForStore = globalThis as unknown as { __mmStore?: UserRetailersStore };

function getStore(): UserRetailersStore {
  if (!globalForStore.__mmStore) {
    globalForStore.__mmStore = { retailers: new Map(), teams: new Map() };
  }
  return globalForStore.__mmStore;
}

export function registerRetailer(r: Retailer): Retailer {
  const store = getStore();
  store.retailers.set(r.id, r);
  return r;
}

export function getRetailer(id: string): Retailer | undefined {
  const store = getStore();
  if (store.retailers.has(id)) return store.retailers.get(id);
  return getSeedData().retailers.find((x) => x.id === id);
}

export function updateRetailerDistributor(id: string, distributorId: string): Retailer | undefined {
  const r = getRetailer(id);
  if (!r) return undefined;
  const updated: Retailer = { ...r, distributorId };
  const store = getStore();
  store.retailers.set(id, updated);
  return updated;
}

export function saveTeam(team: Team): Team {
  const store = getStore();
  store.teams.set(team.retailerId, { ...team, lockedAt: Date.now() });
  return store.teams.get(team.retailerId)!;
}

export function getTeam(retailerId: string): Team | undefined {
  const store = getStore();
  if (store.teams.has(retailerId)) return store.teams.get(retailerId);
  return getSeedData().sampleTeams.find((t) => t.retailerId === retailerId);
}

export function listAllTeamsForST(salesTerritoryId: string): Team[] {
  const seed = getSeedData();
  const store = getStore();
  const distributorIds = new Set(
    seed.distributors.filter((d) => d.salesTerritoryId === salesTerritoryId).map((d) => d.id),
  );
  const sampleRetailerIds = new Set(
    seed.retailers.filter((r) => distributorIds.has(r.distributorId)).map((r) => r.id),
  );
  const teams: Team[] = [];
  for (const t of seed.sampleTeams) {
    if (sampleRetailerIds.has(t.retailerId)) teams.push(t);
  }
  for (const [rid, team] of store.teams.entries()) {
    const r = getRetailer(rid);
    if (r && distributorIds.has(r.distributorId)) {
      const filteredIdx = teams.findIndex((x) => x.retailerId === rid);
      if (filteredIdx >= 0) teams[filteredIdx] = team;
      else teams.push(team);
    }
  }
  return teams;
}
