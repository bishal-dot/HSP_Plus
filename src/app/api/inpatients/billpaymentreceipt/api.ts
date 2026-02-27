import { ReceiptPaymentForBillMasterResponse } from "@/types/billDetails.types";

export const fetchReceiptPaymentForBillMaster = async(
    token: string, 
    IPDCode: string
) :Promise<ReceiptPaymentForBillMasterResponse[]> => {
    const res = await fetch(`/api/inpatients/billpaymentreceipt/${IPDCode}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ IPDCode: IPDCode }),
        cache: "no-cache",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch Bill Payment Receipt");
    }

    const json = await res.json();

    return json.data ?? [];
}