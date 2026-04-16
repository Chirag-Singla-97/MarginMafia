"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const STAGES = [
  { href: "/team", label: "Selection" },
  { href: "/live", label: "Live month" },
  { href: "/rewards", label: "Month end" },
];

export function StageSwitcher() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(search.get("dev") === "1");
  }, [search]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-soil-900 bg-soil-900 text-white shadow-2xl">
      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/60">Dev · Stage</div>
      <div className="flex gap-0.5 p-1 pt-0">
        {STAGES.map((s) => {
          const active = pathname === s.href;
          return (
            <Link
              key={s.href}
              href={`${s.href}?dev=1`}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                active ? "bg-white text-soil-900" : "text-white/80 hover:bg-white/10"
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
