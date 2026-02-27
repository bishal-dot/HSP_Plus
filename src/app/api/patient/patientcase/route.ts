// app/api/patient-case/route.ts
'use server';

import { NextRequest, NextResponse } from "next/server";
import { DbParameter, QueryDefault } from "@/lib/db";
import sql from "mssql";
import { PatientCaseFormData } from "@/types/patient.type";

export async function POST(req: NextRequest) {
  try {
    const data: PatientCaseFormData = await req.json();

    // Filter out undefined or null fields
    const keys = Object.keys(data).filter(k => data[k as keyof PatientCaseFormData] != null);

    // Build SQL parameters
    const params: DbParameter[] = keys.map(k => {
      let type: any = sql.NVarChar(1500); // default

      // Match table column types
      switch (k) {
        case "UnkID": type = sql.BigInt; break;
        case "RegCode":
        case "ConsultantCode":
        case "DeptCode":
        case "CenterID": type = sql.Int; break;
        case "IsPregnent":
        case "IsAnyMemberWithLeprosy":
        case "IsRefferedCounsling":
        case "IsNerveFunctionAssesment":
        case "IsProvideHealthEducation":
        case "IsNeuritis":
        case "Ulcer":
        case "DrugReaction": type = sql.NVarChar(10); break;
        default: type = sql.NVarChar(1500);
      }

      return { name: k, type, value: data[k as keyof PatientCaseFormData] };
    });

    // Build INSERT statement dynamically
    const query = `
      INSERT INTO dbo.HSP_LeprosyPatientRecord (${keys.join(",")})
      VALUES (${keys.map(k => "@" + k).join(",")})
    `;

    const result = await QueryDefault(query, params);

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error("Error inserting patient record:", err);
    return NextResponse.json({ success: false, message: err.message || "Failed to save record" });
  }
}
