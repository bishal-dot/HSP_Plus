"use client";
import Button from "@/components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthToken } from "@/context/AuthContext";
import { SsdReferredResponse } from "@/types/estimate.type";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";

const patientQueryKeys = (authToken: string) => ["serviceTypes", authToken];

export default function Dashboard({ children }: { children: React.ReactNode; }) {
  const router = useRouter();
  const { authToken } = useAuthToken();

  const {
    data: patientInfo = [],
    isLoading: patientLoading,
    isError: patientError,
    error: patientErrorObj,
  } = useQuery<SsdReferredResponse[], Error>({
    queryKey: patientQueryKeys(authToken!),
    queryFn: async () => {
      const res = await fetch("/api/ssdestimate/estimated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenNo: authToken }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch patient info");
      }
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Unexpected response format");
      return result.data;
    },
    enabled: !!authToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (patientLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        Loading...
      </div>
    );
  }

  if (patientError) {
    const errorMsg = patientErrorObj?.message || "An error occurred while loading data.";
    return (
      <div className="flex items-center justify-center min-h-screen p-6 text-red-600">
        Error: {errorMsg}
      </div>
    );
  }


  return (
    <div className="container mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">SSD Referred List</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/5 dark:bg-white/3">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[275.5px] min-h-[45vh] max-h-[70vh]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/5 sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
                  <TableRow>
                    {["Patient Name", "Patient Code", "Age/ Sex", "Amount", "Status", "Action"].map((header) => (
                      <TableCell
                        key={header}
                        isHeader
                        className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {patientInfo && patientInfo.map((refferred, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {refferred.FirstName} {refferred.LastName}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {refferred.PatientCode}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {refferred.Age} / {refferred.Sex}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {refferred.TotalAmount}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {refferred.RefferredStatus == 1 ? "Verified" : "Pending"}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {refferred.RefferredStatus == 0 ? (
                          <Button variant="outline" size="sm" onClick={() => router.push(`/ssd-refer/${refferred.PatientCode}/${refferred.RegCode}/${refferred.EstimateId}`)}>
                            Refer
                          </Button>
                        ) : (
                          "Cannot Edit"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
