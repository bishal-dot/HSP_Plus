import { fetchSsdDonors } from "@/services/ssddonor.service";
import { ApiRequest } from "@/types/api.type";
import { NextRequest, NextResponse } from "next/server";

export async function getSsdDonors(request: NextRequest) {
    try {
        const body = await request.json();
        const databaseRequest = body as ApiRequest<null>;
        return NextResponse.json(await fetchSsdDonors(databaseRequest));
    } catch {
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}