import { getServiceMasterFromDb } from "@/services/ptservices/serviceTypeService";
import { NextResponse } from "next/server";

export async function GET() {
    try{
        const data = await getServiceMasterFromDb();
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message });
    }
}