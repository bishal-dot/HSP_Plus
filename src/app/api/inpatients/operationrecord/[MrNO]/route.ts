import { getOperationRecordFromDb } from "@/services/operationrecord.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request:NextRequest,
    { params }: { params: { MrNO: string } }
) {
    try{
        const { MrNO } = await params;
        const data = await getOperationRecordFromDb(MrNO);
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Failed to fetch" }, { status: 500 });
    }
}