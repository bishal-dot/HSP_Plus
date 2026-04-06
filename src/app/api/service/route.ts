import { getServices } from "@/controllers/service.controller";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    return getServices(request);
}
