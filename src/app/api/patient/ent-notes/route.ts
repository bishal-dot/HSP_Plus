import { QueryDefault } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { patientInfo, payload } = body;
        const { PatientCode, RegCode, RegNo, AdmitDate, Date } = patientInfo;

        // console.log("API POST:", body);

        for (const row of payload) {
            try {
                await QueryDefault(`
                    INSERT INTO hsp_EarDiagnosisRecord
                        (FiscalYear, RegCode, PatientCode, TypeId, InvestigationId, Value)
                    VALUES (@FiscalYear, @RegCode, @PatientCode, @TypeId, @InvestigationId, @Value)
                `, [
                    { name: 'FiscalYear', type: sql.NVarChar(50), value: AdmitDate || Date },
                    { name: 'RegCode', type: sql.Int(), value: parseInt(RegCode) || parseInt(RegNo) },
                    { name: 'PatientCode', type: sql.NVarChar(50), value: PatientCode },
                    { name: 'TypeId', type: sql.Int(), value: row.TypeId },
                    { name: 'InvestigationId', type: sql.Int(), value: row.InvestigationId },
                    { name: 'Value', type: sql.NVarChar(sql.MAX), value: row.Value },
                ]);
            } catch (err: any) {
                console.error(" Error inserting row:", row);
                console.error(err);  // <-- THIS will show the exact SQL error
                throw err;           // rethrow so you still know the request failed
            }
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API POST failed:", error);
        return NextResponse.json({ success: false, message: error.message || error }, { status: 500 });
    }
}