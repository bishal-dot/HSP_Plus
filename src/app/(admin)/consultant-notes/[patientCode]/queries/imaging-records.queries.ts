import { fetchImagingRecords } from "@/app/api/patient/imaging/api";
import { ImagingRecords } from "@/services/imaging.service";
import { useQuery } from "@tanstack/react-query";

export const imagingDataKeys = {
    all: ['imagingData'] as const,
    list: (patientcode: string) => ['imagingData', patientcode] as const,
}

export const useImagingRecords = (token: string | null, patientcode?: string | null) => {
  return useQuery<ImagingRecords[]>({
    enabled: !!token && !!patientcode,
    queryKey: patientcode ? imagingDataKeys.list(patientcode) : imagingDataKeys.all,
    queryFn: () => {
      if(!token || !patientcode) throw new Error('Token or PATIENTCODE is missing');
      return fetchImagingRecords(token!, patientcode);
    },
    staleTime: 1000 * 30,
  })
}