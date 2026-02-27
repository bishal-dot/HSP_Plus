import { DischargeSummaryType } from "@/types/dischargesummary.types";

export const fetchDischargeSummaryByMRNO = async (
    token: string, 
    MrNO: string
): Promise<DischargeSummaryType[]> => {
    const response = await fetch(`/api/inpatients/dischargeSummary/${MrNO}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-cache",
    });

    if(!response.ok) throw new Error("Failed to fetch Discharge Summary");
    const json = await response.json();
    return json.data ?? [];
}