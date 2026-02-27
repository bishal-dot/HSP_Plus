import { fetchOperationRecordByMrNO } from "@/app/api/inpatients/operationrecord/api";
import { OperationRecordType } from "@/types/operationrecord.types";
import { useQuery } from "@tanstack/react-query";

export const operatioRecordkeys = {
    all: ["operationRecord"] as const,
    byMrNO: (MrNO: string) => [...operatioRecordkeys.all, "byMrNO", MrNO] as const,
};

export const useOperationRecord = (token: string | null, MrNO?: string | null) => {
    return useQuery<OperationRecordType[]>({
        enabled: !!token && !!MrNO,
        queryKey: MrNO ? operatioRecordkeys.byMrNO(MrNO) : operatioRecordkeys.all,
        queryFn: () => {
            if (!token || !MrNO) throw new Error("Token or MRNO is missing");
            return fetchOperationRecordByMrNO(token!, MrNO);
        },
        staleTime: 1000 * 30,
    })
};