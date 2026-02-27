import { getSsdRefferredEstimate } from "@/controllers/estimate.contoller";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    return await getSsdRefferredEstimate(request);
}
