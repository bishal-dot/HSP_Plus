import { getOperationRecordByMrno } from "@/controllers/operationrecord.controller";
import { fetchOperationRecordFromDb, getOperationRecordFromDb } from "@/services/operationrecord.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request:NextRequest,
    { params }: { params: { mrno: string } }
) {
        // const data = await getOperationRecordFromDb(MrNO);
        const tokenNo = request.headers.get('Authorization')?.replace('Bearer ', '') || '';
        const mrno = params.mrno;

        console.log("Token No", tokenNo, "MRNO", mrno);
        const data = await getOperationRecordByMrno(tokenNo, mrno);
        return NextResponse.json(data);
}