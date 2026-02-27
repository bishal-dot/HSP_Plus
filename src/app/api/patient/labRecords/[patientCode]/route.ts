import { getlabDataForConsultant } from "@/controllers/labRecords.controller";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request:NextRequest,
    {params}: {params: {Patientcode: string}}
) {
    const data = await getlabDataForConsultant(request);
    return NextResponse.json({data});
}