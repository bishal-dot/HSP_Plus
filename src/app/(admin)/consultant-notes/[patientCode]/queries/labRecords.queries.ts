import { fetchLabRecords } from "@/app/api/patient/labRecords/api";
import { labReportsResponse } from "@/types/labRecords.type";
import { useQuery } from "@tanstack/react-query";

export const labDataKeys = {
    all: ['labData'] as const,
    list: (Patientcode: string) => [...labDataKeys.all, 'list', Patientcode] as const,
};

export const useLabRecords = (token: string | null, patientcode?: string | null) => {
  return useQuery<labReportsResponse[]>({
    enabled: !!token && !!patientcode,
    queryKey: patientcode ? labDataKeys.list(patientcode) : labDataKeys.all,
    queryFn: () => {
      if(!token || !patientcode) throw new Error('Token or PATIENTCODE is missing');
      return fetchLabRecords(token!, patientcode);
    },
    staleTime: 1000 * 30,
  })
}