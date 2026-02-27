import { consultantNotesRequest, consultantNotesResponse } from "@/types/consultant-notes.type";

export const fetchConsultantNotesByPatientCode = async (
  token: string,
  patientcode: string
): Promise<consultantNotesResponse[]> => {
  const res = await fetch(`/api/patient/consultant-notes/${patientcode}`,{
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ PATIENTCODE: patientcode }),
      cache: "no-cache",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Consultant Notes");
  }
  const json = await res.json();
  return json.data?.data ?? [];
};
