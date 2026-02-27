import { getFacultyMaster } from "@/services/master.service";
import { NextResponse } from "next/server";

export async function GET() {
    try{
        const data = await getFacultyMaster();
        return NextResponse.json(data);
    }catch (error:any){
        return NextResponse.json(
            {message: error.message || "Failed to load masters"},
            {status: 500}
        );
    }
}