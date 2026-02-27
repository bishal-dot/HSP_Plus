import { opdPatientDayWiseRequest } from "@/types/patient.type";

export const fetchOPDpatientDayWise = async (
    token: string,
    params: opdPatientDayWiseRequest
) => {
    const res = await fetch("/api/patient/opd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenNo: token, data: params }),
        cache: 'no-cache'
    });

    if(!res.ok) throw new Error("Failed to fetch OPD Patients");
    return res.json();
}