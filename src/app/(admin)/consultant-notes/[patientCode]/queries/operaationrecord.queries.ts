import { fetchOperationRecordByMrNO } from "@/app/api/inpatients/operationrecord/api";
import { OperationRecordType } from "@/types/operationrecord.types";
import { useQuery } from "@tanstack/react-query";

export const operatioRecordkeys = {
    all: ["operationRecord"] as const,
    byMrNO: (mrno: string) => [...operatioRecordkeys.all, "byMrNO", mrno] as const,
};

export const useOperationRecord = (token: string | null, mrno?: string | null) => {
    return useQuery<OperationRecordType[]>({
        enabled: !!token && !!mrno,
        queryKey: mrno ? operatioRecordkeys.byMrNO(mrno) : operatioRecordkeys.all,
        queryFn: () => {
            if (!token || !mrno) throw new Error("Token or MRNO is missing");
            return fetchOperationRecordByMrNO(token!, mrno);
        },
        staleTime: 1000 * 30,
    })
};