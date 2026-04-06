import { getDefaultPool } from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET() {
    const pool = await getDefaultPool();
    const result = await pool.request().query(`SELECT Unkid, Alias FROM GPHmd_Live.dbo.hsp_OTGroupMaster ORDER BY Alias`);
    return NextResponse.json(result.recordset);
}