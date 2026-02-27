import { getImagingRecords } from "@/services/imaging.service";
import { NextResponse } from "next/server";

interface Params {
  patientCode: string;
}
export async function GET(  
  request: Request,
  context: { params: Promise<Params> }
) {
  try {
    const { patientCode } = await context.params;
    const data = await getImagingRecords(patientCode);
    
    return NextResponse.json({ data:data });
  } catch (error: any) {
    console.error("Full Error Details:", error.message, error.stack); // Check your terminal!
    return NextResponse.json(
        { message: error.message || "Failed to fetch" }, 
        { status: 500 }
    );
}
}
