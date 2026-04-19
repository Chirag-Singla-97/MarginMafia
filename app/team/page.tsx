"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, MapPin, Clock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProductCard } from "@/components/product-card";
import { ProductDetailSheet } from "@/components/product-detail-sheet";
import { TeamDrawer } from "@/components/team-drawer";
import { Avatar } from "@/components/avatar";
import { useTeamStore } from "@/store/team-store";
import { CATEGORIES, type Product, type CategoryId } from "@/lib/types";
import { canAdd, TOTAL_PICKS } from "@/lib/team-rules";

export default function TeamBuilderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [retailer, setRetailer] = useState<any>(null);
  const [territory, setTerritory] = useState<any>(null);
  const [activeCat, setActiveCat] = useState<CategoryId>("spec-plant-nutrition");
  const [search, setSearch] = useState("");
  const [subFilter, setSubFilter] = useState("all");
  const [detail, setDetail] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { picks, add, remove, toggle, captainId, viceCaptainId } = useTeamStore();

  useEffect(() => {
    Promise.all([fetch("/api/bootstrap").then((r) => r.json()), fetch("/api/products").then((r) => r.json())]).then(
      ([boot, prods]) => {
        if (!boot.retailer) return router.replace("/");
        if (!boot.confirmed) return router.replace("/confirm");
        setRetailer(boot.retailer);
        setTerritory(boot.territory);
        setProducts(prods.products);
        setLoaded(true);
      },
    );
  }, [router]);

  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const byCategory = useMemo(() => {
    const map: Record<CategoryId, Product[]> = {
      "spec-plant-nutrition": [],
      "crop-protection": [],
      "veg-seeds": [],
      "hybrid-seeds": [],
      "research-seeds": [],
    };
    for (const p of products) map[p.category].push(p);
    return map;
  }, [products]);

  const subCategories = useMemo(() => {
    const set = new Set<string>();
    for (const p of byCategory[activeCat]) if (p.subCategory) set.add(p.subCategory);
    return ["all", ...Array.from(set).sort()];
  }, [byCategory, activeCat]);

  const visible = useMemo(() => {
    const s = search.trim().toLowerCase();
    return byCategory[activeCat].filter((p) => {
      if (subFilter !== "all" && p.subCategory !== subFilter) return false;
      if (s) {
        const hay = `${p.name} ${p.shortDesc} ${p.composition} ${p.cropTarget}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [byCategory, activeCat, subFilter, search]);

  const pickedIds = useMemo(() => new Set(picks.map((p) => p.productId)), [picks]);

  async function lockTeam() {
    setBusy(true);
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ picks, captainId, viceCaptainId }),
    });
    if (!res.ok) {
      setBusy(false);
      return;
    }
    router.push("/live");
  }

  if (!loaded) return <AppShell><div className="p-10 text-center text-ink-400">Loading products…</div></AppShell>;

  return (
    <AppShell
      eyebrow={
        <div className="flex items-center gap-2 flex-wrap">
          <span className="chip">Step 2 of 2 · Build team</span>
          {territory && (
            <span className="chip chip-field"><MapPin className="h-3 w-3" /> {territory.name}</span>
          )}
          <span className="chip chip-brand"><Clock className="h-3 w-3" /> Selection window · closes soon</span>
          <span className="chip">{picks.length}/{TOTAL_PICKS} picks</span>
        </div>
      }
      title="Pick your squad"
      subtitle={`${products.length} products · 1–3 from each of 5 categories · total exactly ${TOTAL_PICKS} · mark a Captain (2×) and Vice-Captain (1.5×).`}
      right={retailer && (
        <div className="flex items-center gap-2.5">
          <Avatar seed={retailer.avatarSeed} name={retailer.name} size={40} />
          <div className="hidden md:block leading-tight">
            <div className="text-sm font-bold">{retailer.name}</div>
            <div className="text-xs text-ink-400">{retailer.shopName}</div>
          </div>
        </div>
      )}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="pb-28 lg:pb-0">
          {/* Category tabs */}
          <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {CATEGORIES.map((c) => {
              const count = picks.filter((p) => p.category === c.id).length;
              const active = activeCat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => { setActiveCat(c.id); setSubFilter("all"); }}
                  className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                    active
                      ? "border-ink-900 bg-ink-900 text-white shadow-card"
                      : "border-ink-100 bg-white text-ink-700 hover:border-ink-300 hover:shadow-card"
                  }`}
                >
                  <span className="text-base">{c.emoji}</span>
                  <span>{c.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    active ? "bg-white/15 text-white" :
                    count === 0 ? "bg-ink-100 text-ink-500" :
                    count >= 1 && count <= 3 ? "bg-field-100 text-field-700" : "bg-rose-100 text-rose-700"
                  }`}>{count}/3</span>
                </button>
              );
            })}
          </div>

          {/* Filters */}
          <div className="mb-5 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                className="input pl-10"
                placeholder={`Search ${CATEGORIES.find((c) => c.id === activeCat)!.name.toLowerCase()}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 pointer-events-none" />
              <select
                value={subFilter}
                onChange={(e) => setSubFilter(e.target.value)}
                className="input pl-10 pr-10 appearance-none cursor-pointer min-w-[180px]"
              >
                {subCategories.map((sc) => (
                  <option key={sc} value={sc}>{sc === "all" ? "All sub-categories" : sc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Count */}
          <div className="mb-3 flex items-center justify-between text-xs font-semibold text-ink-500">
            <span>{visible.length} product{visible.length === 1 ? "" : "s"}</span>
          </div>

          {/* Grid */}
          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 p-12 text-center">
              <div className="text-4xl">🔍</div>
              <div className="mt-2 font-bold text-ink-900">No products match</div>
              <div className="mt-1 text-sm text-ink-500">Try a different filter.</div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((p) => {
                const picked = pickedIds.has(p.id);
                const disabled = !picked && !canAdd(picks, p.category);
                return (
                  <ProductCard
                    key={p.id}
                    product={p}
                    picked={picked}
                    disabledAdd={disabled}
                    isCaptain={captainId === p.id}
                    isViceCaptain={viceCaptainId === p.id}
                    onToggle={() => toggle(p.id, p.category)}
                    onInfo={() => setDetail(p)}
                  />
                );
              })}
            </div>
          )}
        </div>

        <TeamDrawer productsById={productsById} onSubmit={lockTeam} busy={busy} />
      </div>

      <ProductDetailSheet
        product={detail}
        picked={detail ? pickedIds.has(detail.id) : false}
        disabledAdd={detail ? !canAdd(picks, detail.category) && !pickedIds.has(detail.id) : false}
        onClose={() => setDetail(null)}
        onToggle={() => {
          if (!detail) return;
          if (pickedIds.has(detail.id)) remove(detail.id);
          else add(detail.id, detail.category);
          setDetail(null);
        }}
      />
    </AppShell>
  );
}
