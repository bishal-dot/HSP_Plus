import { getSeviceRate } from "@/services/ptservices/rateService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const serviceCode = parseInt(searchParams.get("serviceCode") || "0");
    const rateType = parseInt(searchParams.get("rateType") || "0");

    try{
        const rate = await getSeviceRate(serviceCode, rateType);
        return NextResponse.json({ success: true, rate });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message });
    }
}