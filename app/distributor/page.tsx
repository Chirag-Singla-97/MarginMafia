"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ArrowRight, Building2, MapPin, Check, Sparkles } from "lucide-react";
import { Avatar } from "@/components/avatar";

interface Distributor {
  id: string;
  name: string;
  salesTerritoryId: string;
  city: string;
  territory: { id: string; name: string; region: string } | null;
}
interface Retailer {
  id: string;
  name: string;
  shopName: string;
  avatarSeed: string;
  distributorId: string;
}

export default function DistributorPage() {
  const router = useRouter();
  const [retailer, setRetailer] = useState<Retailer | null>(null);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/bootstrap").then((r) => r.json()), fetch("/api/distributors").then((r) => r.json())])
      .then(([boot, dist]) => {
        if (!boot.retailer) {
          router.replace("/");
          return;
        }
        setRetailer(boot.retailer);
        setDistributors(dist.distributors);
        setSelected(boot.retailer.distributorId || "");
        setLoaded(true);
      });
  }, [router]);

  const selectedDist = useMemo(
    () => distributors.find((d) => d.id === selected) ?? null,
    [selected, distributors],
  );

  async function confirm() {
    if (!selected) return;
    setBusy(true);
    const res = await fetch("/api/distributor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ distributorId: selected }),
    });
    if (!res.ok) {
      setBusy(false);
      return;
    }
    router.push("/team");
  }

  if (!loaded) return <AppShell><div className="p-10 text-center text-ink-400">Loading…</div></AppShell>;

  const grouped = distributors.reduce<Record<string, Distributor[]>>((acc, d) => {
    const key = d.territory?.name || "Unknown";
    (acc[key] = acc[key] || []).push(d);
    return acc;
  }, {});

  const territoryAccent: Record<string, string> = {
    "North Zone": "from-amber-100 via-brand-50 to-white",
    "West Zone": "from-field-100 via-field-50 to-white",
    "South Zone": "from-sky-100 via-blue-50 to-white",
  };

  return (
    <AppShell
      eyebrow={<span className="chip">Step 1 of 3 · Distributor</span>}
      title={retailer ? `Welcome, ${retailer.name.split(" ")[0]} 👋` : "Welcome"}
      subtitle="Tell us which distributor you buy from — we'll auto-detect your Sales Territory."
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
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-7">
          {Object.entries(grouped).map(([stName, list]) => (
            <section key={stName}>
              <div className={`mb-3 flex items-center gap-2 rounded-xl border border-ink-100 bg-gradient-to-r ${territoryAccent[stName] || "from-ink-50 to-white"} px-4 py-2.5`}>
                <MapPin className="h-4 w-4 text-ink-700" />
                <span className="font-display text-sm font-bold text-ink-900">{stName}</span>
                <span className="text-[11px] text-ink-500">· {list[0].territory?.region}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {list.map((d) => {
                  const active = selected === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelected(d.id)}
                      className={`group relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                        active
                          ? "border-ink-900 bg-white shadow-elev scale-[1.01]"
                          : "border-ink-100 bg-white hover:border-ink-300 hover:shadow-card"
                      }`}
                    >
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                        active ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-600 group-hover:bg-brand-100 group-hover:text-brand-700"
                      }`}>
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-ink-900 truncate">{d.name}</div>
                        <div className="flex items-center gap-1 text-xs text-ink-500">
                          <MapPin className="h-3 w-3" /> {d.city}
                        </div>
                      </div>
                      {active && (
                        <div className="absolute top-3 right-3 rounded-full bg-ink-900 p-1 text-white shadow">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <aside className="lg:sticky lg:top-20 h-fit">
          <div className="card-elev overflow-hidden">
            <div className="bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-5 text-white">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
                <Sparkles className="h-3 w-3" /> Your setup
              </div>
              {selectedDist ? (
                <>
                  <div className="mt-2 font-display text-xl font-bold leading-tight">{selectedDist.name}</div>
                  <div className="mt-0.5 text-xs text-white/60">{selectedDist.city}</div>
                  <div className="mt-4 rounded-xl bg-white/10 p-3 backdrop-blur">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">Sales Territory</div>
                    <div className="mt-0.5 font-display text-lg font-bold">{selectedDist.territory?.name}</div>
                    <div className="text-[11px] text-white/70">{selectedDist.territory?.region}</div>
                  </div>
                </>
              ) : (
                <div className="mt-2 text-sm text-white/60">Select a distributor to continue…</div>
              )}
            </div>
            <div className="space-y-3 p-5">
              <p className="text-xs text-ink-500">
                You'll compete on this territory's leaderboard. Only products sold here count for your team.
              </p>
              <button onClick={confirm} disabled={!selected || busy} className="btn btn-brand btn-lg w-full">
                {busy ? "…" : <>Continue <ArrowRight className="h-4 w-4" /></>}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
