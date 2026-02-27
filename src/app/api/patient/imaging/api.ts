import { ImagingRecords } from "@/services/imaging.service";

export const fetchImagingRecords = async(
    token: string,
    Patientcode: string
): Promise<ImagingRecords[]> => {
    const res = await fetch(`/api/patient/imaging/${Patientcode}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        // body: JSON.stringify({ Patientcode: Patientcode }),
        cache: "no-cache",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch Imaging Records");
    }
    const json = await res.json();
    return json.data ?? [];
}