import { getSsdDonors } from "@/controllers/ssddonor.controller";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    return getSsdDonors(request);
}