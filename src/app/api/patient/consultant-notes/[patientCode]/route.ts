import { getConsultantNotesByPatientCode } from "@/controllers/consultant-notes.controller";
import { getEarDiagnosisRecord } from "@/services/consultant-notes.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request:NextRequest,
    {params}: {params: {patientcode: string}}
) {
    const data = await getConsultantNotesByPatientCode(request);
    return NextResponse.json({data});
}

export async function GET(
    request:NextRequest,
    {params}: {params: {patientcode: string}}
) {
    const data = await getEarDiagnosisRecord(params.patientcode);
    return NextResponse.json({data});
}