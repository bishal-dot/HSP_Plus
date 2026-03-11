import { getProgressNoteByMRNOFromDb } from "@/services/progress-note.service";
import { NextResponse } from "next/server";

export async function getProgressNoteByMRNO(tokenNo: string, mrno: string) {
    try{
        if(!tokenNo) return {success: false, message: "Authorization token is required", data: []}

        if(!mrno) return {success: false, message: "MRNO is required", data: []}

        const progressNote = await getProgressNoteByMRNOFromDb({ tokenNo, data: { MrNo: mrno }});
        
        return progressNote; // already has {success, message, data}
    } catch {
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        });
    }
    
}