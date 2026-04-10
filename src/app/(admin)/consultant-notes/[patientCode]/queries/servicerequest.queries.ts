import { fetchServiceRequest } from "@/app/api/patient/patientservice/api";
import { ServiceRqByMrnoResponse } from "@/types/service.type";
import { useQuery } from "@tanstack/react-query";

export const serviceRequestkeys = {
    all: ['serviceRequest'] as const,
    list: (mrno: string) => [...serviceRequestkeys.all, mrno] as const
};

export const useServiceRequest = (token: string | null, mrno: string | null) => {
    return useQuery<ServiceRqByMrnoResponse[]>({
        enabled: !!token && !!mrno,
        queryKey: serviceRequestkeys.list(mrno ?? ''),
        queryFn: () => {
            if(!token || !mrno) throw new Error('Token or MRNO is missing');
            return fetchServiceRequest(token!, mrno!);
        },
        staleTime: 1000 * 30
    })
}