// controllers/bill-details.controller.ts
import { fetchbillMasterFromDb, fetchIPDReceiptPaymentForBillMasterFromDb } from "@/services/billDetails.service";
import { BillMasterRequest } from "@/types/billDetails.types";
import { NextRequest } from "next/server";

export async function getBillDetails(request: NextRequest) {
  try {
    const body = await request.json();
    const { IPDCode } = body;

    const authHeader = request.headers.get("Authorization");
    const tokenNo = authHeader?.replace("Bearer ", "") || "";

    if(!tokenNo) return {success: false, message: "Authorization token is required", data: []}

    if(!IPDCode) return {success: false, message: "IPD Code is required", data: []}

    const billMaster = await fetchbillMasterFromDb({
        tokenNo,
        data: { IPDCode, IsDateWise: false },
    });
    return {
      success: true,
      message: "Bill details fetched successfully",
      data: billMaster,
    };
  } catch (error) {
    return { success: false, message: "Internal Server Error" };
  }
}

export async function getReceiptPaymentForBillMaster(request: NextRequest) {
    try{
        const body = await request.json();
        const { IPDCode } = body;

        const authHeader = request.headers.get("Authorization");
        const tokenNo = authHeader?.replace("Bearer ", "") || "";

        if(!tokenNo) return {success: false, message: "Authorization token is required", data: []}

        if(!IPDCode) return {success: false, message: "IPD Code is required", data: []}

        const IPDReceiptPayment = await fetchIPDReceiptPaymentForBillMasterFromDb({
            tokenNo,
            data: { IPDCode },
        });
        return {
            success: true,
            message: "Bill payment receipt fetched successfully",
            data: IPDReceiptPayment,
        };
    } catch(error) {
        return ({
            success: false,
            message: "Internal Server Error"
        })
    }
}