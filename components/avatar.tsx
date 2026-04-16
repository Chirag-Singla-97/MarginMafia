import { hash, initials } from "@/lib/utils";

const PALETTE = [
  "bg-gradient-to-br from-brand-400 to-brand-600",
  "bg-gradient-to-br from-field-400 to-field-700",
  "bg-gradient-to-br from-sky-400 to-blue-700",
  "bg-gradient-to-br from-fuchsia-400 to-purple-700",
  "bg-gradient-to-br from-rose-400 to-red-600",
  "bg-gradient-to-br from-teal-400 to-cyan-700",
  "bg-gradient-to-br from-lime-400 to-field-600",
  "bg-gradient-to-br from-indigo-400 to-violet-700",
  "bg-gradient-to-br from-amber-400 to-orange-600",
  "bg-gradient-to-br from-emerald-400 to-teal-700",
];

export function Avatar({ seed, name, size = 40 }: { seed: string; name: string; size?: number }) {
  const idx = hash(seed) % PALETTE.length;
  const fontSize = Math.round(size * 0.4);
  return (
    <span
      className={`avatar ${PALETTE[idx]}`}
      style={{ width: size, height: size, fontSize }}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}
