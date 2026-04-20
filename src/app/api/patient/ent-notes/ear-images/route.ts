export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // Prevents stale results

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

  const grouped: Record<string, { R?: string; L?: string; date: string }> = {};

  for (const file of files) {
    if (!file.endsWith(".png")) continue;

    // New regex to match: 2026_04_20_07_17_01_R_ear_1.png
    const match = file.match(/^(\d{4}_\d{2}_\d{2}_\d{2}_\d{2}_\d{2})_(R|L)_ear_(\d+)\.png$/);

    if (!match) continue;

    const [, fullDateTime, side, sequence] = match;
    const dateOnly = fullDateTime.split('_').slice(0, 3).join('_'); // 2026_04_20

    if (!grouped[fullDateTime]) {
      grouped[fullDateTime] = { date: dateOnly, R: undefined, L: undefined };
    }

    grouped[fullDateTime][side as "R" | "L"] = `/uploads/ent/${patientId}/${file}`;
  }

  // Sort newest first
  const images = Object.values(grouped)
    .sort((a, b) => b.date.localeCompare(a.date))   // or use fullDateTime for more precision
    .map(record => ({
      date: record.date,
      R: record.R,
      L: record.L,
    }));

  return NextResponse.json({ images });
}