import { ServiceRqByMrnoResponse } from "@/types/service.type";

export const fetchServiceRequest = async (
    token: string,
    mrno: string
) : Promise<ServiceRqByMrnoResponse[]> => {
    const res = await fetch(`/api/patient/patientservice/${mrno}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            tokenNo: token,
            data:{
                mrno: mrno,
                centercode: '1'
            }
            }),
        cache: "no-cache",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch Service Request");
    }
    const json = await res.json();
    return json.data ?? [];
}