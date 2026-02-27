import { fetchIPDPatients } from "@/app/api/inpatients/info/api";
import { useQuery } from "@tanstack/react-query"

export const ipdKeys = {
    all: ['ipd'] as const,
    list: (params: unknown) => [...ipdKeys.all, 'list', params] as const,
};

export const useIPDPatients = (
    token: string | null,
    params: {
        centerCode: string
        search?: string
    }
) => useQuery({
    enabled: !!token,
    queryKey: ipdKeys.list(params),
    queryFn: () => fetchIPDPatients(token!, params),
    // keepPreviousData: true,
    staleTime: 1000 * 30,
});