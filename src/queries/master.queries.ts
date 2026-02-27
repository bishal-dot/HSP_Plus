import { fetchFacultyMaster } from "@/app/api/masters/facultymaster/api";
import { fetchPrescriptionMaster } from "@/app/api/masters/prescription/api";
import { useQuery } from "@tanstack/react-query";

const masterKeys = {
    all: ["prescription-master"] as const,
    list: () => [...masterKeys.all, "list"] as const,
};

export const usePrescriptionMaster = (token: string | null) => {
    return useQuery({
        enabled: !!token,
        queryKey: masterKeys.all,
        queryFn: () => {
            if(!token) throw new Error('Token is missing');
            return fetchPrescriptionMaster(token);
        },
        staleTime: 1000 * 60 * 60
    });
};

const masterDataKeys = {
    all: ["faculty-master"] as const,
    list: () => [...masterDataKeys.all, "list"] as const,
};

export const useFacultyMaster = (token: string | null) => useQuery({
    enabled: !!token,
    queryKey: masterDataKeys.all,
    queryFn: () => {
        if(!token) throw new Error('Token is missing');
        return fetchFacultyMaster(token);
    },
    staleTime: 1000 * 60 * 60
});
