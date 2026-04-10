import { getNextTranNo, insertInvoiceDetail } from "@/services/ptservices/invoiceService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const fiscalYear = searchParams.get('fiscalYear');

    if (action === 'nextTranNo' && fiscalYear) {
        const nextTranNo = await getNextTranNo(fiscalYear || '');
        return NextResponse.json({ success: true, tranNo: nextTranNo });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' });
}

export async function POST(request:NextRequest) {
    try{
        const services = await request.json();

        const results = [];
        for (const service of Array.isArray(services) ? services : [services]) {
            const result = await insertInvoiceDetail(service);
            results.push(result)
        }
        return NextResponse.json({ success: true, data: results });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message });
    }
}