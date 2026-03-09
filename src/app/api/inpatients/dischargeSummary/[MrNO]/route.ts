import { getDischargeSummaryFromDb } from "@/controllers/dischargesummary.controller";
import { fetchDischargeSummaryFromDb } from "@/services/dischargesummary.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    return getDischargeSummaryFromDb(request);

}