"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Avatar } from "@/components/avatar";
import { ArrowRight, Building2, MapPin, Phone, Store, Sparkles, Check, AlertTriangle } from "lucide-react";

export default function ConfirmPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/bootstrap").then((r) => r.json()).then((d) => {
      if (!d.retailer) return router.replace("/");
      if (d.confirmed && d.team) return router.replace("/live");
      if (d.confirmed) return router.replace("/team");
      setData(d);
      setLoaded(true);
    });
  }, [router]);

  async function confirm() {
    setBusy(true);
    const res = await fetch("/api/confirm", { method: "POST" });
    if (!res.ok) {
      setBusy(false);
      return;
    }
    router.push("/team");
  }

  if (!loaded) return <AppShell><div className="p-10 text-center text-ink-400">Loading…</div></AppShell>;

  const { retailer, distributor, territory, town, pincode } = data;

  return (
    <AppShell
      eyebrow={<span className="chip">Step 1 of 2 · Confirm your details</span>}
      title={`Welcome, ${retailer.name.split(" ")[0]} 👋`}
      subtitle="Please confirm the details we pulled from the retailer database. If anything looks wrong, contact your sales officer."
      right={
        <div className="flex items-center gap-2.5">
          <Avatar seed={retailer.avatarSeed} name={retailer.name} size={40} />
          <div className="hidden md:block leading-tight">
            <div className="text-sm font-bold">{retailer.name}</div>
            <div className="text-xs text-ink-400">{retailer.shopName}</div>
          </div>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="card-elev p-5">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-400">Retailer</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={<Store className="h-4 w-4" />} label="Name" value={retailer.name} />
              <Field icon={<Store className="h-4 w-4" />} label="Shop" value={retailer.shopName} />
              <Field icon={<Phone className="h-4 w-4" />} label="Phone" value={retailer.phone} />
              <Field icon={<MapPin className="h-4 w-4" />} label="Pincode" value={pincode || "—"} />
            </div>
          </div>

          <div className="card-elev p-5">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-400">Network</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={<Building2 className="h-4 w-4" />} label="Distributor" value={distributor?.name || "—"} sub={distributor?.city} />
              <Field icon={<MapPin className="h-4 w-4" />} label="Sales Territory" value={territory?.name || "—"} sub={territory?.region} />
            </div>
          </div>

          <div className="card-elev p-5">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-400">Shop location</div>
            {town ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field icon={<MapPin className="h-4 w-4" />} label="Town / Sub-district" value={town.subDistrict || "—"} />
                <Field icon={<MapPin className="h-4 w-4" />} label="Locality" value={town.locality || "—"} />
                <Field icon={<MapPin className="h-4 w-4" />} label="District" value={town.district || "—"} />
                <Field icon={<MapPin className="h-4 w-4" />} label="State" value={town.state || "—"} />
              </div>
            ) : (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>We couldn't find this pincode in the locality database. You can still continue — your distributor and territory are already set.</div>
              </div>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 h-fit">
          <div className="card-elev overflow-hidden">
            <div className="bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-5 text-white">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
                <Sparkles className="h-3 w-3" /> Your setup
              </div>
              <div className="mt-2 font-display text-xl font-bold leading-tight">{distributor?.name}</div>
              <div className="mt-0.5 text-xs text-white/60">{distributor?.city}</div>
              <div className="mt-4 rounded-xl bg-white/10 p-3 backdrop-blur">
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">Sales Territory</div>
                <div className="mt-0.5 font-display text-lg font-bold">{territory?.name}</div>
                <div className="text-[11px] text-white/70">{territory?.region}</div>
              </div>
              {town && (
                <div className="mt-3 rounded-xl bg-white/10 p-3 backdrop-blur">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">Town</div>
                  <div className="mt-0.5 font-display text-base font-bold">{town.subDistrict || town.district}</div>
                  <div className="text-[11px] text-white/70">{town.district}, {town.state}</div>
                </div>
              )}
            </div>
            <div className="space-y-3 p-5">
              <p className="text-xs text-ink-500">
                You'll compete on the {territory?.name} leaderboard. Only product sales in your territory count for your team.
              </p>
              <button onClick={confirm} disabled={busy} className="btn btn-brand btn-lg w-full">
                {busy ? "…" : <><Check className="h-4 w-4" /> Looks good — continue <ArrowRight className="h-4 w-4" /></>}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Field({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-600">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">{label}</div>
        <div className="font-semibold text-ink-900 leading-tight">{value}</div>
        {sub && <div className="text-[11px] text-ink-500">{sub}</div>}
      </div>
    </div>
  );
}
