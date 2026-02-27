import { BillMasterResponse } from "@/types/billDetails.types";

export const fetchBillDetails = async(
    token: string,
    IPDCode: string
) :Promise<BillMasterResponse[]> => {
    const res = await fetch(`/api/inpatients/bill-details/${IPDCode}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ IPDCode: IPDCode }),
        cache: "no-cache",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch Bill Details");
    }

    const json = await res.json();
    
    return json.data ?? [];
}

