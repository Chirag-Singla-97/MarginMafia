import { NextResponse } from "next/server";
import { getCurrentRetailerId } from "@/lib/session";
import { repo } from "@/lib/data/repo";
import { validateTeam, type DraftTeam } from "@/lib/team-rules";
import type { Team } from "@/lib/types";

export async function GET() {
  const id = getCurrentRetailerId();
  if (!id) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  return NextResponse.json({ team: repo.getTeam(id) ?? null });
}

export async function POST(req: Request) {
  const id = getCurrentRetailerId();
  if (!id) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));

  const draft: DraftTeam = {
    picks: Array.isArray(body.picks) ? body.picks : [],
    captainId: body.captainId ?? null,
    viceCaptainId: body.viceCaptainId ?? null,
  };
  const result = validateTeam(draft);
  if (!result.valid) {
    return NextResponse.json({ error: "Invalid team", details: result.errors }, { status: 400 });
  }

  const team: Team = {
    retailerId: id,
    picks: draft.picks,
    captainId: draft.captainId!,
    viceCaptainId: draft.viceCaptainId!,
  };
  const saved = repo.saveTeam(team);
  return NextResponse.json({ team: saved });
}
