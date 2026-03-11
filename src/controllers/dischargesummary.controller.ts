import { fetchDischargeSummaryFromDb } from "@/services/dischargesummary.service";
import { ApiRequest } from "@/types/api.type";
import { DischargeSummaryTypeRequest } from "@/types/dischargesummary.types";
import { NextRequest, NextResponse } from "next/server";

export async function getDischargeSummaryByMrno(tokenNo: string, mrno: string) {
    try{
        if(!tokenNo) return {success: false, message: "Authorization token is required", data: []}

        if(!mrno) return {success: false, message: "MRNO is required", data: []}

        const dischargeSummary = await fetchDischargeSummaryFromDb({ tokenNo, data: { Mrno: mrno } });
        
        return dischargeSummary; // already has {success, message, data}
    } catch {
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}