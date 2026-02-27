import { userLogin } from "@/controllers/auth.controller";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    return userLogin(request);
}