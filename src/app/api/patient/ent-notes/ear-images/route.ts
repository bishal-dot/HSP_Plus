// /api/patient/ent-notes/ear-images/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(req: NextRequest) {
  const patientId = req.nextUrl.searchParams.get("patientId");

  if (!patientId) {
    return NextResponse.json({ success: false, message: "patientId required" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), `public/uploads/ent/${patientId}`);

  if (!fs.existsSync(dir)) {
    return NextResponse.json({ images: [] });
  }

  const files = fs.readdirSync(dir);

  // Group by date: { "2026_01_17": { R: "/uploads/ent/.../..._R_ear.png", L: "..." } }
  const grouped: Record<string, { R?: string; L?: string }> = {};

  for (const file of files) {
    if (!file.endsWith(".png")) continue;

    // filename format: 2026_01_17_R_ear.png
    const match = file.match(/^(\d{4}_\d{2}_\d{2})_(R|L)_ear\.png$/);
    if (!match) continue;

    const [, date, side] = match;
    if (!grouped[date]) grouped[date] = {};
    grouped[date][side as "R" | "L"] = `/uploads/ent/${patientId}/${file}`;
  }

  // Return as sorted array (newest first)
  const images = Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, sides]) => ({ date, ...sides }));

  return NextResponse.json({ images });
}