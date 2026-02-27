import { fetchBillDetails } from "@/app/api/inpatients/bill-details/api";
import { fetchReceiptPaymentForBillMaster } from "@/app/api/inpatients/billpaymentreceipt/api";
import { BillMasterResponse, ReceiptPaymentForBillMasterResponse } from "@/types/billDetails.types";
import { useQuery } from "@tanstack/react-query";

export const billMasterData = {
    all: ['billMasterData'] as const,
    list: (IPDCode: string) => [...billMasterData.all, 'list', IPDCode] as const
};

export const useBillMasters = (token: string | null, IPDCode?: string | null) => {
    return useQuery<BillMasterResponse[]>({
        enabled: !!token && !!IPDCode,
        queryKey: IPDCode ? billMasterData.list(IPDCode) : billMasterData.all,
        queryFn: () => {
            if(!token || !IPDCode) throw new Error('Token or IPDCode is missing');
            return fetchBillDetails(token!, IPDCode);
        },
        staleTime: 1000 * 30,
    })
}

export const billPaymentReceiptData = {
    all: ['billPaymentReceiptData'] as const,
    list: (IPDCode: string) => [...billPaymentReceiptData.all, 'list', IPDCode] as const
}

export const useBillPaymentReceipt = (token: string | null, IPDCode?: string | null) => {
    return useQuery<ReceiptPaymentForBillMasterResponse[]>({
        enabled: !!token && !!IPDCode,
        queryKey: IPDCode ? billPaymentReceiptData.list(IPDCode) : billPaymentReceiptData.all,
        queryFn: () => {
            if(!token || !IPDCode) throw new Error('Token or IPDCode is missing');
            return fetchReceiptPaymentForBillMaster(token!, IPDCode);
        },
        staleTime: 1000 * 30,
    })
}