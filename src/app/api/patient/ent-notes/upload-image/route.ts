export const runtime  = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  const { image, patientId, side, unkId } = await req.json();

  const base64 = image.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");

  const dateStr = new Date()
    .toISOString()         // "2026-04-20T06:50:26.000Z"
    .replace("T", "_")     // "2026-04-20_06:50:26.000Z"
    .replace(/-/g, "_")    // "2026_04_20_06:50:26.000Z" 
    .replace(/:/g, "_")    // "2026_04_20_06_50_26.000Z"
    .split(".")[0]; 

  const dir = path.join(process.cwd(), `public/uploads/ent/${patientId}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // clean filename
  const originalName = `${side}_ear`;

  const fileName = `${dateStr}_${originalName}_${unkId || 'unknown'}.png`;

  const filePath = path.join(dir, fileName);

  fs.writeFileSync(filePath, buffer);

  const url = `/uploads/ent/${patientId}/${fileName}`;

  //  return url
  return NextResponse.json({ 
    filePath: url
 });
}