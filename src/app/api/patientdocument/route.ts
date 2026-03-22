import { getPatientInfo } from "@/controllers/patient.controller";
import { getPatientMasterFromDb } from "@/services/patient.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
   return getPatientMasterFromDb();
}