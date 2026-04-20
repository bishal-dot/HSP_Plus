export const runtime  = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  const { image, patientId, side } = await req.json();   // ← remove unkId

  const base64 = image.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");

  const now = new Date();
  const dateStr = now
    .toISOString()
    .replace("T", "_")
    .replace(/-/g, "_")
    .replace(/:/g, "_")
    .split(".")[0];   // e.g. 2026_04_20_07_17_01

  const dir = path.join(process.cwd(), `public/uploads/ent/${patientId}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // --- Generate sequential number (R_ear_1, R_ear_2, etc.) ---
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

  // Count how many images already exist for this side on this exact dateStr
  const existingForThisSideAndDate = files.filter(file => 
    file.includes(`${dateStr}_${side}_ear`)
  ).length;

  const sequence = existingForThisSideAndDate + 1;   // 1, 2, 3...

  const fileName = `${dateStr}_${side}_ear_${sequence}.png`;

  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, buffer);

  const url = `/uploads/ent/${patientId}/${fileName}`;

  return NextResponse.json({ 
    filePath: url,
    date: dateStr,
    sequence 
  });
}