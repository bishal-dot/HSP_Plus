import { getDefaultPool, QueryDefault } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getNepaliFiscalYear } from "@/lib/utils";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { patientInfo, presentComplaints, previousHistory, treatmentPlan, payload } = body;
        const { PatientCode, MRNo, RegCode, RegNo, AdmitDate, Date: PatientDate } = patientInfo || {};

        if (!PatientCode && !MRNo) {
            return NextResponse.json({ success: false, message: "PatientCode is required" }, { status: 400 });
        }

        console.log("PatientCode from route", PatientCode || MRNo)
        
        const regCodeValue = parseInt(RegCode) || parseInt(RegNo);
        const fiscalYear = getNepaliFiscalYear();
        const patientId = parseInt(PatientCode) || parseInt(MRNo);
        const generateUnkID = () => Date.now() * 1000 + Math.floor(Math.random() * 1000);

        const pool = await getDefaultPool();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        const maxRes = await pool.request()
            .query(`SELECT ISNULL(MAX(UnkID), 0) + 1 AS NextID FROM GPHmd_LIVE.dbo.hsp_DoctorsNotePTWise`);
        const newUnkID = maxRes.recordset[0].NextID;

        try {
            await QueryDefault(
                `INSERT INTO GPHmd_LIVE.dbo.hsp_DoctorsNotePTWise
                    (UnkID, FiscalYear, PatientCode, RegCode, PresentComplaints, PreviousHistory, TreatmentPlan)
                VALUES (@UnkID, @FiscalYear, @PatientCode, @RegCode, @PresentComplaints, @PreviousHistory, @TreatmentPlan)`,
                [
                    { name: 'UnkID',            type: sql.BigInt(),          value: newUnkID },  
                    { name: 'FiscalYear',        type: sql.NVarChar(50),    value: fiscalYear },
                    { name: 'PatientCode',       type: sql.NVarChar(50),    value: PatientCode || MRNo },
                    { name: 'RegCode',           type: sql.Int(),             value: regCodeValue },     
                    { name: 'PresentComplaints', type: sql.NVarChar(sql.MAX), value: presentComplaints },
                    { name: 'PreviousHistory',   type: sql.NVarChar(sql.MAX), value: previousHistory },
                    { name: 'TreatmentPlan',     type: sql.NVarChar(sql.MAX), value: treatmentPlan },
                ],
                transaction
            );

            if (payload && payload.length > 0) {
                for (const row of payload) {
                    await QueryDefault(
                        `INSERT INTO GPHmd_LIVE.dbo.hsp_EarDiagnosisRecord
                            (FiscalYear, RegCode, PatientCode, TypeId, InvestigationId, Value)
                        VALUES (@FiscalYear, @RegCode, @PatientCode, @TypeId, @InvestigationId, @Value)`,
                        [
                            { name: 'FiscalYear',       type: sql.NVarChar(50),    value: fiscalYear },
                            { name: 'RegCode',          type: sql.Int(),             value: regCodeValue },  
                            { name: 'PatientCode',      type: sql.NVarChar(50),    value: PatientCode || MRNo },
                            { name: 'TypeId',           type: sql.Int(),             value: row.TypeId },    
                            { name: 'InvestigationId',  type: sql.Int(),             value: row.InvestigationId },
                            { name: 'Value',            type: sql.NVarChar(sql.MAX), value: row.Value },
                        ],
                        transaction
                    );
                }
            }

            await transaction.commit();
            return NextResponse.json({ success: true, message: "Data saved successfully" });

        } catch (err: any) {
            await transaction.rollback();
            console.error(err);
            throw err;
        }

    } catch (error: any) {
        console.error("API POST failed:", error);
        return NextResponse.json({ success: false, message: error.message || error }, { status: 500 });
    }
}