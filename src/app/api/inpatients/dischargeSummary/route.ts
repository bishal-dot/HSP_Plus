import { DbParameter, getDefaultPool } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

export async function POST(request:NextRequest) {
    try{
        const body = await request.json();

        const {
            DischargeID, CenterCode, MrNO, IPDCode, formData
        } = body;
        
        const pool = await getDefaultPool();
        const masRes = await pool.request()
            .query(`SELECT ISNULL(MAX(UnkCode), 0) + 1 as UNKID FROM GPHmd_LIVE.dbo.IPD_DischargeRecordMaster;`);
        const UNKID = masRes.recordset[0].UNKID;

        const noteParams: DbParameter[] = [
            { name: 'UnkCode', type: sql.BigInt(), value: UNKID },
            { name: 'DischargeID', type: sql.Int(), value: DischargeID },
            { name: 'CenterCode', type: sql.Int(), value: CenterCode },
            { name: 'MrNO', type: sql.NVarChar(50), value: MrNO },
            { name: 'IPDCode', type: sql.Int(), value: IPDCode },
            { name: 'formData', type: sql.NVarChar(sql.MAX), value: formData }
        ];
    } catch (error) {
        console.log('error', error);
        return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
    }
}