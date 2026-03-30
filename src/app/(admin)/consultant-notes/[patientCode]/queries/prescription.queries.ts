import { fetchPrescriptionHistory } from "@/app/api/patient/prescription/api";
import { fetchMedicineListFromDb } from "@/app/api/patient/prescription/medicine/api";
import { Con_QueryAsync } from "@/lib/db";
import { MedicineListResponse, PrescriptionHistoryResponse } from "@/types/prescription.type";
import { useQuery } from "@tanstack/react-query";
import { error } from "console";

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

export const medicineListKeys = {
  all: ["medicine-list"] as const,
  list: ( PatientCode: string ) => [...medicineListKeys.all, 'list'] as const
}

export const useMedicineList = (token: string | null, PatientCode?: string ) => {
  return useQuery<MedicineListResponse[]>({
    enabled: !!token && !!PatientCode,
    queryKey: PatientCode ? medicineListKeys.list(PatientCode) : medicineListKeys.all,
    queryFn: () => {
      if(!token || !PatientCode) throw new Error('Token or PatientCode is missing');
      return fetchMedicineListFromDb(token!, PatientCode);
    },
    staleTime: 1000 * 30
  })
};


