import { dischargedPatientsRequest } from "@/types/patient.type";

export const fetchDischargedPatients = async (
    token: string,
    params: dischargedPatientsRequest & {
        DTFROM: string;
        dtto: string;
        patientname?: string;
        mrno?: string;
        centercode: string;
    }
) => {
    const res = await fetch("/api/inpatients/discharged", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenNo: token, data: params }),
        cache: 'no-cache'
    });
    if(!res.ok) throw new Error("Failed to fetch Discharged Patients");
    return res.json();
}