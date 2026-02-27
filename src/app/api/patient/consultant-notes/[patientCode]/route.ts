import { getConsultantNotesByPatientCode } from "@/controllers/consultant-notes.controller";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request:NextRequest,
    {params}: {params: {patientcode: string}}
) {
    const data = await getConsultantNotesByPatientCode(request);
    return NextResponse.json({data});
}