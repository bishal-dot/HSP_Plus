import { fetchDischargeSummaryByMRNO } from "@/app/api/inpatients/dischargeSummary/api"
import { DischargeSummaryType } from "@/types/dischargesummary.types"
import { useQuery } from "@tanstack/react-query"

export const dischargeSummaryKeys = {
    all: ['dischargeSummary'] as const,
    list: (MrNO: string) => [...dischargeSummaryKeys.all, 'list'] as const
}

export const useDischargeSummary = (token: string | null, MrNO?: string | null) => {
    return useQuery<DischargeSummaryType[]>({
        enabled: !!token && !!MrNO,
        queryKey: MrNO ? dischargeSummaryKeys.list(MrNO) : dischargeSummaryKeys.all,
        queryFn: () => {
            if(!token || !MrNO) throw new Error('Token or MRNO is missing');
            return fetchDischargeSummaryByMRNO(token!, MrNO);
        },
        staleTime: 1000 * 30
    })
};