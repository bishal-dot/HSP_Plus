import { insertInvoiceMaster } from "@/services/ptservices/invoiceService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest) {
    try{
        const services = await request.json();

        const results = [];
        for (const service of Array.isArray(services) ? services : [services]) {
            const result = await insertInvoiceMaster(service);
            results.push(result)
        }
        return NextResponse.json({ success: true, data: results });
    } catch (error: any) {
        console.error("Master Error:", error); 
        return NextResponse.json({ success: false, message: error.message });
    }
}