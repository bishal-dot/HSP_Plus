import { fetchPatientMaster } from "@/app/api/patientdocument/api";
import { useQuery } from "@tanstack/react-query";

export const patientMasterKeys = {
    all: ['patientMaster'] as const,
    list: (params: unknown) => [...patientMasterKeys.all, 'list', params] as const
}

export const usePatientMaster = (token: string | null, params: any) => useQuery({
    enabled: !!token,
    queryKey: patientMasterKeys.list(params),
    queryFn: () => fetchPatientMaster(token!),
    staleTime: 1000 * 30,   
});