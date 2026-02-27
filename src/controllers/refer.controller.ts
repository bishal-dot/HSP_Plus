import { savePatientSsdRefer } from "@/services/refer.service";
import { ApiRequest } from "@/types/api.type";
import { SsdReferRequest } from "@/types/refer.type";
import { NextRequest, NextResponse } from "next/server";

export async function postSsdRefer(request: NextRequest) {
    try {
        const body = await request.json();
        const databaseRequest = body as ApiRequest<SsdReferRequest>;
        return NextResponse.json(await savePatientSsdRefer(databaseRequest));
    } catch {
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}
