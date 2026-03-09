import { OperationRecordType } from "@/types/operationrecord.types";

export const fetchOperationRecordByMrNO = async (
    token: string,
    mrno: string
): Promise<OperationRecordType[]> => {
    const response = await fetch(`/api/inpatients/operationrecord/${mrno}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mrno: mrno }),
        cache: "no-cache",
    });

    if (!response.ok) throw new Error("Failed to fetch Operation Record");
    const json = await response.json();
    return json.data ?? [];
}
