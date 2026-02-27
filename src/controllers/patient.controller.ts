import { fetchDischargedPatientInfo, fetchInpatientInfo, fetchOPDpatientAll, fetchOPDPatientsDayWise, fetchPatientInfo } from "@/services/patient.service";
import { ApiRequest, RequiredApiRequest } from "@/types/api.type";
import { dischargedPatientsRequest, inPatientRequest, opdPatientDayWiseRequest, opdPatientRequest, patientRequest } from "@/types/patient.type";
import { NextRequest, NextResponse } from "next/server";

export async function getPatientInfo(request: NextRequest){
    try {
        const body = await request.json();
        const databaseRequest = body as RequiredApiRequest<patientRequest>;
        return NextResponse.json(await fetchPatientInfo(databaseRequest));
    } catch {
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}

export async function getOPDPatientsDayWise(request: NextRequest) {
    try{
        const body = await request.json();
        const databaseRequest = body as RequiredApiRequest<opdPatientDayWiseRequest>;
        return NextResponse.json(await fetchOPDPatientsDayWise(databaseRequest));
    }catch{
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}

export async function getOPDPatientAll(request: NextRequest) {
    try{
        const body = await request.json();
        const databaseRequest = body as RequiredApiRequest<opdPatientRequest>;
        return NextResponse.json(await fetchOPDpatientAll(databaseRequest));
    } catch {
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}

export async function getInpatientInfo(request: NextRequest) {
    try{
        const body = await request.json();
        const databaseRequest = body as RequiredApiRequest<inPatientRequest>;
        return NextResponse.json(await fetchInpatientInfo(databaseRequest));
    } catch {
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}

export async function getDischargerdPatientInfo(request:NextRequest){
    try{
        const body = await request.json();
        const databaseRequest = body as RequiredApiRequest<dischargedPatientsRequest>;
        return NextResponse.json(await fetchDischargedPatientInfo(databaseRequest));
    } catch {
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}