import { ProgressNote } from "@/services/progress-note.service";

export const fetchProgressNoteByMRNO = async (
    token: string,
    MRNO: string
): Promise<ProgressNote[]>  => {
    const response = await fetch(`/api/inpatients/progress-note/${MRNO}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-cache",
    });

    if(!response.ok) throw new Error("Failed to fetch Progress Note");
    const json = await response.json();
    return json.data ?? [];
}