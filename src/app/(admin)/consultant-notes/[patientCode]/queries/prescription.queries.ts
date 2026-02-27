import { fetchPrescriptionHistory } from "@/app/api/patient/prescription/api";
import { Con_QueryAsync } from "@/lib/db";
import { PrescriptionHistoryResponse } from "@/types/prescription.type";
import { useQuery } from "@tanstack/react-query";

export const prescriptionHistoryKeys = {
    all: ["prescription-history"],
    list: ({ PatientCode }: { PatientCode: string }) => [...prescriptionHistoryKeys.all, PatientCode],
}

export const usePrescriptionHistory = (token: string | null, PatientCode?: string | null) => {
  return useQuery<PrescriptionHistoryResponse[]>({
    enabled: !!token && !!PatientCode,
    queryKey: PatientCode ? prescriptionHistoryKeys.list({ PatientCode: PatientCode }) : prescriptionHistoryKeys.all,
    queryFn: () => {
      if(!token || !PatientCode) throw new Error('Token or PATIENTCODE is missing');
      return fetchPrescriptionHistory(token!, PatientCode);
    },
    staleTime: 1000 * 30,
    
  })
}



