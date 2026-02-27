import { inPatientRequest } from "@/types/patient.type";

export const fetchIPDPatients = async (
    token: string,
    params: inPatientRequest & {
        centerCode: string;
    }
) => {
    const res = await fetch("/api/inpatients/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenNo: token, data: params }),
        cache: 'no-cache'
    });

    if(!res.ok) throw new Error("Failed to fetch IPD Patients");

    return res.json();
}