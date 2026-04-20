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
  const grouped: Record<string, { date: string; R?: string; L?: string; unkid?: string }> = {};

  for (const file of files) {
    if (!file.endsWith(".png")) continue;

    // A more resilient regex: 
    // Captures Date (1), Time (2), Side (3), and optionally an unkId (4)
    const match = file.match(/^(\d{4}_\d{2}_\d{2})_(\d{2}_\d{2}_\d{2})_(R|L)_ear_?(.*?)\.png$/);
    
    if (!match) {
        continue;
    }

    const [, date, time, side, unkId] = match;
    const sessionKey = `${date}_${time}`;

    if (!grouped[sessionKey]) {
      grouped[sessionKey] = { 
        // We format it here so the frontend can display it easily
        date: `${date}_${time}`, 
        unkid: unkId || sessionKey 
      };
    }

    grouped[sessionKey][side as "R" | "L"] = `/uploads/ent/${patientId}/${file}`;
  }

  // Convert to array and sort by sessionKey (string sort works for YYYY_MM_DD_HH_MM_SS)
  const images = Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));

  return NextResponse.json({ images });
}