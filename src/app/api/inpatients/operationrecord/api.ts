import { OperationRecordType } from "@/types/operationrecord.types";

export const fetchOperationRecordByMrNO = async (
    token: string,
    MrNO: string
): Promise<OperationRecordType[]> => {
    const response = await fetch(`/api/inpatients/operationrecord/${MrNO}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-cache",
    });

    if (!response.ok) throw new Error("Failed to fetch Operation Record");
    const json = await response.json();
    return json.data ?? [];
}
