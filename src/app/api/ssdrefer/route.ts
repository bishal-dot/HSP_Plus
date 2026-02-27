import { postSsdRefer } from "@/controllers/refer.controller";
import { NextRequest } from "next/server";


export async function POST(request: NextRequest) {
    return await postSsdRefer(request);
}
