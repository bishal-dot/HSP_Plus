import { NextRequest, NextResponse } from "next/server";
import { createOrUpdatePrescription, getPrescriptionHistory } from "@/services/prescription.service";

// Get the patient's prescription history
export async function GET(
  request: Request,
 {params}: { params: Promise<{ PatientCode: string }> }
) {
  try {
    const { PatientCode }  = await params;

    const data = await getPrescriptionHistory(PatientCode);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch" },
      { status: 500 }
    );
  }
}

// add new prescription data
export async function POST(request: NextRequest) {
  try{
    const body = await request.json();
    const result = await createOrUpdatePrescription(body);
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
