import { QueryDefault } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");

        if( !type ) {
            return NextResponse.json(
                { message: "Type is required" },
                { status: 400 }
            );
        } 

        const services = await QueryDefault(`
            SELECT ServiceCode, ServiceName
            FROM GPHmd_LIVE.dbo.hsp_ServiceMaster
            WHERE ServiceType IN (
                SELECT ServiceType 
                FROM GPHmd_LIVE.dbo.Hsp_ServiceTypeSelection 
                WHERE Title = ${type}
            )
            AND InActive = 0
        `);

        return NextResponse.json(services);
    } catch (err:any) {
        return NextResponse.json(
            { message: err.message || "Failed to load services" },
            { status: 500 }
        );
    }
}