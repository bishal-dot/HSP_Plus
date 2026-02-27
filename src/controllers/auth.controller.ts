import { userLoginService, userLoginUsingOrgIdandUserIdService } from "@/services/auth.service";
import { ApiRequest } from "@/types/api.type";
import { LoginRequest } from "@/types/login.type";
import { NextRequest, NextResponse } from "next/server";

export async function userLogin(request: NextRequest){
    try {
        const body = await request.json();
        const databaseRequest = body as ApiRequest<LoginRequest>;
        return NextResponse.json(await userLoginService(databaseRequest));
    } catch {
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}

export async function userLoginUsingOrgIdandUserId(request: NextRequest){
    try {
        const body = await request.json();
        const databaseRequest = body as ApiRequest<LoginRequest>;
        return NextResponse.json(await userLoginUsingOrgIdandUserIdService(databaseRequest));
    } catch {
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}