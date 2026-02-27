import { fetchOPDpatientFilter, fetchOPDPatients } from "@/app/api/patient/info/api";
import { fetchOPDpatientDayWise } from "@/app/api/patient/opd/api";
import { fetchOPDpatientAll } from "@/services/patient.service";
import { opdPatientDayWiseRequest, opdPatientRequest } from "@/types/patient.type";
import { useQuery } from "@tanstack/react-query";

export const opdKeys = {
    all: ['opd'] as const,
    list: (params: unknown) => [...opdKeys.all, 'list', params] as const,
    // allPatients: (params: unknown) => [...opdKeys.all, 'allPatients', params] as const
};

export const useOPDPatients = (
    token: string | null,
    params: opdPatientRequest,
    // options?: { enabled?: boolean }
) => useQuery({
    enabled: !!token,
    queryKey: opdKeys.list(params),
    queryFn: () => fetchOPDpatientAll({
        tokenNo: token!, 
        data:params
    }),
    select: (res) => res.data ?? [],
    // keepPreviousData: true,
    staleTime: 1000 * 30,
});


export const opdDayWiseKeys = {
    all: ['opdDayWise'] as const,
    list: (params: unknown) => [...opdDayWiseKeys.all, 'list', params] as const,
};

export const useOPDPatientsDayWise = (
    token: string | null,
    params: opdPatientDayWiseRequest,
    options?: { enabled?: boolean }
) => useQuery({
    enabled: options?.enabled !== undefined ? options.enabled : !!token,
    queryKey: opdDayWiseKeys.list(params),
    queryFn: () => fetchOPDpatientDayWise(token!, params),
    // keepPreviousData: true,
    staleTime: 1000 * 30,
});

