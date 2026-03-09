import { fetchOperationRecordFromDb } from "@/services/operationrecord.service";
import { NextRequest } from "next/server";

export async function getOperationRecordByMrno(tokenNo: string, mrno: string) {
    try{
        if(!tokenNo) return {success: false, message: "Authorization token is required", data: []}

        if(!mrno) return {success: false, message: "MRNO is required", data: []}

        const operationRecords = await fetchOperationRecordFromDb({ tokenNo, data: { mrno } });
        
        return operationRecords; // already has {success, message, data}
    } catch (error) {
    return {
        success: false,
        message: "Internal Server Error"
    }  
    }
}