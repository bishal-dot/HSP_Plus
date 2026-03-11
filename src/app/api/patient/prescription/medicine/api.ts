import { MedicineListResponse } from "@/types/prescription.type";

export const fetchMedicineListFromDb = async (
  token: string,
  PatientCode: string
): Promise<MedicineListResponse[]> => {

  const response = await fetch(
    `/api/patient/prescription/medicine?PatientCode=${PatientCode}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Medicine List");
  }

  const json = await response.json();
  return json?.data ?? [];
};