import sql from "mssql";
import { DbParameter, QueryDefault } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface PatientServiceData {
    Fiscalyear?: string;
    TranNo?: number;
    Sno?: number;
    ServiceCode?: number;
    DeptCode?: number;
    Rate?: number;
    Discount?: number;
    Qty?: number;
    Amount?: number;
    TaxAmt?: number;
    Remarks?: string;
    C_datetime?: Date | string;
    centercode?: number;
}

export async function POST(request: NextRequest) {
    try {
        const servicesArray: PatientServiceData[] = await request.json();

        // If it's not an array, make it one
        const services = Array.isArray(servicesArray) ? servicesArray : [servicesArray];

        const results = [];

        for (const data of services) {
            // Filter out undefined or null fields - only include fields that have actual values
            const keys = Object.keys(data).filter(
                k => {
                    const val = data[k as keyof PatientServiceData];
                    return val !== null && val !== undefined && val !== "";
                }
            );

            // Build SQL parameters
            const params: DbParameter[] = keys.map(k => {
                let type: any;
                let value: string | number | Date = data[k as keyof PatientServiceData] as any;

                // Map fields to SQL types based on hsp_InvoiceRequestDetail table
                switch (k) {
                    case "Fiscalyear":
                        type = sql.VarChar(15);
                        break;
                    case "Remarks":
                        type = sql.NVarChar(50);
                        break;
                    case "TranNo":
                        type = sql.BigInt;
                        value = parseInt(value as string);
                        break;
                    case "Sno":
                    case "ServiceCode":
                    case "DeptCode":
                    case "Qty":
                    case "centercode":
                        type = sql.Int;
                        value = parseInt(value as string);
                        break;
                    case "Rate":
                    case "Discount":
                    case "Amount":
                    case "TaxAmt":
                        type = sql.Money;
                        value = parseFloat(value as string);
                        break;
                    case "C_datetime":
                        type = sql.DateTime;
                        value = new Date(value as string);
                        break;
                    default:
                        type = sql.NVarChar(200);
                }

                return {
                    name: k,
                    type: type,
                    value: value
                } as DbParameter;
            });

            const query = `
                INSERT INTO [dbo].[hsp_InvoiceRequestDetail]
                (${keys.join(", ")})
                VALUES (${keys.map(k => "@" + k).join(", ")})
            `;
            
            const result = await QueryDefault(query, params);
            results.push(result);
        }

        return NextResponse.json({ success: true, data: results });
    } catch (error) {
        console.error("Error in POST /api/patient/patientservice:", error);
        return NextResponse.json({ 
            success: false, 
            error: (error as Error).message,
            details: error 
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tranNo = searchParams.get("tranNo");
        const fiscalYear = searchParams.get("fiscalYear");
        const action = searchParams.get("action");

        // Get next TranNo
        if (action === "nextTranNo") {
            const result = await QueryDefault(`
                SELECT ISNULL(MAX(TranNo), 0) + 1 as NextTranNo
                FROM [dbo].[hsp_InvoiceRequestDetail]
                WHERE Fiscalyear = @Fiscalyear
            `, [
                { name: "Fiscalyear", type: sql.VarChar(15), value: fiscalYear || "2025/2026" }
            ]);

            const nextTranNo = result[0]?.NextTranNo || 1;
            return NextResponse.json({ success: true, tranNo: nextTranNo });
        }

        // Get saved services
        let query = `
            SELECT 
                ird.Fiscalyear, ird.TranNo, ird.Sno, ird.ServiceCode, ird.DeptCode, 
                ird.Rate, ird.Discount, ird.Qty, ird.Amount, ird.TaxAmt, ird.Remarks, 
                ird.C_datetime, ird.centercode,
                sm.ServiceName, sm.Alias
            FROM [dbo].[hsp_InvoiceRequestDetail] ird
            LEFT JOIN [dbo].[hsp_ServiceMaster] sm ON ird.ServiceCode = sm.ServiceCode
            WHERE 1=1
        `;

        const params: DbParameter[] = [];

        if (tranNo) {
            query += ` AND ird.TranNo = @TranNo`;
            params.push({ name: "TranNo", type: sql.BigInt(), value: parseInt(tranNo) });
        }

        if (fiscalYear) {
            query += ` AND ird.Fiscalyear = @Fiscalyear`;
            params.push({ name: "Fiscalyear", type: sql.VarChar(15), value: fiscalYear });
        }

        query += ` ORDER BY ird.Sno`;

        const result = await QueryDefault(query, params);
        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("Error in GET /api/patient/patientservice:", error);
        return NextResponse.json({ 
            success: false, 
            error: (error as Error).message 
        }, { status: 500 });
    }
}