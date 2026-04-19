import { fetchConsultantNotesByPatientCode, fetchEarDiagnosisRecord } from "@/app/api/patient/consultant-notes/api";
import { getEarDiagnosisRecord } from "@/services/consultant-notes.service";
import { ApiResponse } from "@/types/api.type";
import { consultantNotesResponse, earDiagnosisRecordResponse } from "@/types/consultant-notes.type";
import { useQuery } from "@tanstack/react-query";

export const consultantNotesKeys = { 
    all: ['consultant-notes'] as const,
    list: (patientcode: string) => [...consultantNotesKeys.all, 'list', patientcode] as const,
 };

export const useConsultantNotes = (token: string | null, patientcode?: string | null) => {
  return useQuery<consultantNotesResponse[]>({
    enabled: !!token && !!patientcode,
    queryKey: patientcode ? consultantNotesKeys.list(patientcode) : consultantNotesKeys.all,
    queryFn: () => {
      if(!token || !patientcode) throw new Error('Token or PATIENTCODE is missing');
      return fetchConsultantNotesByPatientCode(token!, patientcode);
    },
    staleTime: 1000 * 30,
  })
};


export const useEarImages = (authToken: string, patientId: string) =>
  useQuery({
    queryKey: ["ear-images", patientId],
    enabled: !!patientId && !!authToken,
    queryFn: async () => {
      const res = await fetch(`/api/patient/ent-notes/ear-images?patientId=${patientId}`);
      const data = await res.json();
      return data.images as { date: string; R?: string; L?: string }[];
    },
  });