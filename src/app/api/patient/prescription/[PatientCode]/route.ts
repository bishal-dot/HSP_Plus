import { NextRequest, NextResponse } from "next/server";
import { createOrUpdatePrescription, getPrescriptionHistory } from "@/services/prescription.service";

// Get the patient's prescription history
export async function GET(
  request: Request,
  { params }: { params: Promise<{ PatientCode: string }> }
) {
  try {
    const { PatientCode } = await params;

    // Extract tokenNo from headers (or adjust to query param if needed)
    const tokenNo = request.headers.get("Authorization") ?? "";

    const data = await getPrescriptionHistory({
      tokenNo,
      data: { PatientCode },
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch" },
      { status: 500 }
    );
  }
}

// add new prescription data
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ PatientCode: string }> }
) {
  try{
    const body = await request.json();
    const authHeader = request.headers.get("Authorization");
    const tokenNo = authHeader?.replace("Bearer ", "") || "";

    const result = await createOrUpdatePrescription(tokenNo, body);
    if(!result.success){
      return NextResponse.json(
        { 
          success: false, 
          message: result.message
        }
      );
    }
    return NextResponse.json(
      { 
        success: true, 
        data:result
      }
    );
  }catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: error.message || "Failed to create prescription" },
      { status: 500 }
    );
  }
}
