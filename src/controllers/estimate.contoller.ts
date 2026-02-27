import { fetchEstimatedDetails, fetchRefferedList, savePatientSsdEstimate } from "@/services/estimate.service";
import { ApiRequest } from "@/types/api.type";
import { SsdEstimateRequest } from "@/types/estimate.type";
import { patientRequest } from "@/types/patient.type";
import { NextRequest, NextResponse } from "next/server";

export async function postSsdEstimate(request: NextRequest) {
    try {
        const body = await request.json();
        const databaseRequest = body as ApiRequest<SsdEstimateRequest>;
        return NextResponse.json(await savePatientSsdEstimate(databaseRequest));
    } catch {
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}

export async function getSsdRefferredEstimate(request: NextRequest) {
    try {
        const body = await request.json();
        const databaseRequest = body as ApiRequest<null>;
        return NextResponse.json(await fetchRefferedList(databaseRequest));
    } catch {
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}

export async function getSsdEstimatedDetails(request: NextRequest) {
    try {
        const body = await request.json();
        const databaseRequest = body as ApiRequest<patientRequest>;
        return NextResponse.json(await fetchEstimatedDetails(databaseRequest));
    } catch {
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}