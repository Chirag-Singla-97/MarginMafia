"use client";

import { create } from "zustand";
import type { CategoryId, ProductPick } from "@/lib/types";

interface TeamState {
  picks: ProductPick[];
  captainId: string | null;
  viceCaptainId: string | null;
  add: (productId: string, category: CategoryId) => void;
  remove: (productId: string) => void;
  toggle: (productId: string, category: CategoryId) => void;
  setCaptain: (productId: string) => void;
  setViceCaptain: (productId: string) => void;
  clear: () => void;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  picks: [],
  captainId: null,
  viceCaptainId: null,
  add: (productId, category) =>
    set((s) => {
      if (s.picks.some((p) => p.productId === productId)) return s;
      return { picks: [...s.picks, { productId, category }] };
    }),
  remove: (productId) =>
    set((s) => ({
      picks: s.picks.filter((p) => p.productId !== productId),
      captainId: s.captainId === productId ? null : s.captainId,
      viceCaptainId: s.viceCaptainId === productId ? null : s.viceCaptainId,
    })),
  toggle: (productId, category) => {
    const { picks } = get();
    if (picks.some((p) => p.productId === productId)) get().remove(productId);
    else get().add(productId, category);
  },
  setCaptain: (productId) =>
    set((s) => ({
      captainId: s.captainId === productId ? null : productId,
      viceCaptainId: s.viceCaptainId === productId ? null : s.viceCaptainId,
    })),
  setViceCaptain: (productId) =>
    set((s) => ({
      viceCaptainId: s.viceCaptainId === productId ? null : productId,
      captainId: s.captainId === productId ? null : s.captainId,
    })),
  clear: () => set({ picks: [], captainId: null, viceCaptainId: null }),
}));
