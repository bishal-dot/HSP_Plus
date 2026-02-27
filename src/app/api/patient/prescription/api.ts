import { PrescriptionHistoryResponse } from "@/types/prescription.type";

export const fetchPrescriptionHistory =async(
    token: string,
    PatientCode: string
): Promise<PrescriptionHistoryResponse[]> => {
    const response = await fetch(`/api/patient/prescription/${PatientCode}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        // body: JSON.stringify({ Patientcode: Patientcode }),
        cache: "no-cache",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch Prescription History");
    }
    const json = await response.json();
     return Array.isArray(json) ? json : [];
}