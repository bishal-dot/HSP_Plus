import { getDischargerdPatientInfo } from "@/controllers/patient.controller";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    return getDischargerdPatientInfo(request);
}