import { getDischargeSummaryByMrno} from "@/controllers/dischargesummary.controller";
import { fetchDischargeSummaryFromDb } from "@/services/dischargesummary.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const tokenNo = request.headers.get('Authorization')?.replace('Bearer ', '') || '';
    const body = await request.json();
    const mrno = body.MrNO;

    console.log("Token No from route", tokenNo, "MRNO", mrno);
    const data = await getDischargeSummaryByMrno(tokenNo, mrno);
    
    return NextResponse.json(data);
  
}