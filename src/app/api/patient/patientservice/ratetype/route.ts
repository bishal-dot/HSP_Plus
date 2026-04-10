import { serviceRateTypeMaster } from "@/services/ptservices/serviceRateTypeMaster";
import { NextResponse } from "next/server";

export async function GET() {
    try{
        const data = await serviceRateTypeMaster();
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message });
    }
}