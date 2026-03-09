import { fetchDischargeSummaryFromDb } from "@/services/dischargesummary.service";
import { ApiRequest } from "@/types/api.type";
import { DischargeSummaryTypeRequest } from "@/types/dischargesummary.types";
import { NextRequest, NextResponse } from "next/server";

export async function getDischargeSummaryFromDb(request:NextRequest) {
    try{
        const body = await request.json();
        const databaseRequest = body as ApiRequest<DischargeSummaryTypeRequest>;
        return NextResponse.json(await fetchDischargeSummaryFromDb(databaseRequest));
    } catch {
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}