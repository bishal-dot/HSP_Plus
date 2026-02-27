import { fetchDischargedPatients } from "@/app/api/inpatients/discharged/api";
import { useQuery } from "@tanstack/react-query";

export const dischargedKeys = {
    all: ['discharged'] as const,
    list: (params: unknown) => [...dischargedKeys.all, 'list', params] as const
};

export const useDischargedPatients = (
    token: string | null,
    params: {
        centercode: string;
        DTFROM: string;
        dtto: string;
        patientname?: string;
        mrno?: string;
    }
) => {
    const today = new Date();
    const defaultFrom = '2020-01-01'; // earliest date to fetch if not selected
    const defaultTo = today.toISOString().split('T')[0];
    // Convert dates for backend
    const formattedParams = {
        ...params,
        DTFROM: params.DTFROM ? params.DTFROM.split('T')[0] + ' 00:00' : defaultFrom + ' 00:00',
        dtto: params.dtto ? params.dtto.split('T')[0] + ' 23:59' : defaultTo + ' 23:59',
        centercode: params.centercode || '1',
        patientname: params.patientname || '',
        mrno: params.mrno || ''

    };

    return useQuery({
        enabled: !!token,
        queryKey: dischargedKeys.list(formattedParams),
        queryFn: () => fetchDischargedPatients(token!, formattedParams),
        staleTime: 1000 * 30,
    });
};
