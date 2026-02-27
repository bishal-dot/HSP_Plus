import { fetchServices, fetchServiceTypes } from "@/services/service.service";
import { ApiRequest } from "@/types/api.type";
import { ServiceRequest } from "@/types/service.type";
import { NextRequest, NextResponse } from "next/server";

export async function getServiceTypes(request: NextRequest){
    try {
        const body = await request.json();
        const databaseRequest = body as ApiRequest<null>;
        return NextResponse.json(await fetchServiceTypes(databaseRequest));
    } catch {
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}

export async function getServices(request: NextRequest){
    try {
        const body = await request.json();
        const databaseRequest = body as ApiRequest<ServiceRequest>;
        return NextResponse.json(await fetchServices(databaseRequest));
    } catch {
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}