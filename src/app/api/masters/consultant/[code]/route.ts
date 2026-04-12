import { getDefaultPool } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        const pool = await getDefaultPool();

        const result = await pool.request()
            .input("consultantCode", sql.Int, parseInt(code))
            .query(`
                SELECT CAST(FacultyCode AS INT) AS FacultyCode
                FROM GPHmd_Live.dbo.hsp_ConsaltantMaster
                WHERE ConsultantCode = @consultantCode
            `);

        return NextResponse.json(result.recordset[0] ?? null);

    } catch (err: any) {
        return NextResponse.json(
            { message: err.message || "Failed to load consultants" },
            { status: 500 }
        );
    }
}