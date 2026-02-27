import { getDischargeSummaryFromDb } from "@/services/dischargesummary.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request:NextRequest,
    { params }: { params: { MRNO: string } }
) {
    try{
        const { MRNO } = await params;
        const data = await getDischargeSummaryFromDb(MRNO);
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Failed to fetch" }, { status: 500 });
    }
}