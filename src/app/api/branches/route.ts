import { getBranch } from "@/controllers/branch.controller";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    return await getBranch(request);
}