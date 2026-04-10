import { getServiceRequestByMrno } from "@/services/ptservices/servicenote.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try{
        const body = await request.json();

        const response = await getServiceRequestByMrno(body);

        return NextResponse.json(response);
    }catch(e){
        return NextResponse.json({success: false, message: 'Internal Server Error'});
    }
}