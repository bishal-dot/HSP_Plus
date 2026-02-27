import { getReceiptPaymentForBillMaster } from "@/controllers/bill-details.controller";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: { IPDCode: string } }
) {
    const result = await getReceiptPaymentForBillMaster(request);
    return NextResponse.json(result.data);
}