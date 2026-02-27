import { fetchProgressNoteByMRNO } from "@/app/api/inpatients/progress-note/api";
import { ProgressNote } from "@/services/progress-note.service";
import { useQuery } from "@tanstack/react-query";

export const progressNoteKeys = {
    all: ['progressNote'] as const,
    byMRNO: (MRNO: string) => [...progressNoteKeys.all, MRNO] as const,
}

export const useProgressNote = ( token: string | null, MRNO?: string | null) => {
    return useQuery<ProgressNote[]>({
        enabled: !!token && !!MRNO,
        queryKey: MRNO ? progressNoteKeys.byMRNO(MRNO) : progressNoteKeys.all,
        queryFn: () => {
            if(!token || !MRNO) throw new Error('Token or MRNO is missing');
            return fetchProgressNoteByMRNO(token!, MRNO);
        },
        staleTime: 1000 * 30,
    })
};