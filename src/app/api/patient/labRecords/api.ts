import { labReportsResponse } from "@/types/labRecords.type";

export const fetchLabRecords = async (
    token: string,
    Patientcode: string
): Promise<labReportsResponse[]> => {
    const res = await fetch(`/api/patient/labRecords/${Patientcode}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ Patientcode: Patientcode }),
        cache: "no-cache",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch Consultant Notes");
    }
    const json = await res.json();
    return (json.data?.data ?? []).map((r:any) => ({
        ...r,
        majorGroups: Array.isArray(r.majorGroups) ? r.majorGroups : [],
    }));
}