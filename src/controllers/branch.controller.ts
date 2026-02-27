
import { getBranchService } from "@/services/branch.service";
import { ApiRequest } from "@/types/api.type";
import { Branch } from "@/types/branch.type";
import { NextRequest, NextResponse } from "next/server";

export async function getBranch(request: NextRequest){
    try {
        const body = await request.json();
        const databaseRequest = body as ApiRequest<Branch>;
        return NextResponse.json(await getBranchService(databaseRequest));
    } catch {
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}