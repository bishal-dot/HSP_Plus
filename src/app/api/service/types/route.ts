import { getServiceTypes } from "@/controllers/service.controller";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    return getServiceTypes(request);
}