import { opdPatientRequest, patientRequest } from "@/types/patient.type";


export const fetchOPDPatients = async (
    token: string,
    params: patientRequest & {
        pageNumber: number;
        pageSize: number;
        search?: string;
    }
) => {
    const res = await fetch("/api/patient/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenNo: token, data: params }),
        cache: 'no-cache'
    });
    
    if(!res.ok) throw new Error("Failed to fetch OPD Patients");

    return res.json();
};

export const fetchOPDpatientFilter = async (token: string, params: opdPatientRequest) => {
    const res = await fetch("/api/patient/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenNo: token, data: params }),
        cache: 'no-cache'
    });
    if(!res.ok) throw new Error("Failed to fetch OPD Patients");
    return res.json();
}