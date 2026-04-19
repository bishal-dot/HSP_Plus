export const runtime  = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  const { image, patientId, side } = await req.json();

  const base64 = image.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");

  // Date format: 2026_01_17
  const now = new Date();
  const dateStr = now
    .toISOString()
    .split("T")[0]
    .replace(/-/g, "_");

  const dir = path.join(process.cwd(), `public/uploads/ent/${patientId}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // clean filename
  const originalName = `${side}_ear`;

  const fileName = `${dateStr}_${originalName}.png`;

  const filePath = path.join(dir, fileName);

  fs.writeFileSync(filePath, buffer);

  const url = `/uploads/ent/${patientId}/${fileName}`;

  //  return url
  return NextResponse.json({ 
    filePath: url
 });
}