"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import SearchSelect, { SingleValue } from "react-select";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthToken } from "@/context/AuthContext";
import { patientResponse } from "@/types/patient.type";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { ssdDonors } from "@/types/ssddonor.type";
import { SsdReferDetails, SsdReferRequest } from "@/types/refer.type";

interface DonorOption {
  value: string;
  label: string;
}

interface EstimateInfo {
  DonorCode: number;
  DonorName: string;
  amount: number;
  remarks: string;
}

const patientQueryKeys = {
  detail: (patientCode: string, patientOpdCode: string) => ["patient", patientCode, patientOpdCode],
};
const donorsQueryKey = (authToken: string) => ["donors", authToken];

export default function SsdReferToPatientPage() {
  const params = useParams();
  const router = useRouter();
  const { authToken } = useAuthToken();
  const { patientCode, patientOpdCode, estimateId } = params as {
    patientCode: string;
    patientOpdCode: string;
    estimateId: string;
  };

  const [tableSsdReferData, setTableSsdReferData] = useState<EstimateInfo[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<SingleValue<DonorOption> | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>("");

  const {
    data: patientInfo,
    isLoading: patientLoading,
    isError: patientError,
    error: patientErrorObj,
  } = useQuery<patientResponse, Error>({
    queryKey: patientQueryKeys.detail(patientCode, patientOpdCode),
    queryFn: async () => {
      const res = await fetch("/api/patient/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenNo: authToken, data: { opdCode: patientOpdCode, patientCode } }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch patient info");
      }
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Unexpected response format");
      return result.data;
    },
    enabled: !!authToken && !!patientCode && !!patientOpdCode,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: donors = [],
    isLoading: donorsLoading,
  } = useQuery<DonorOption[], Error>({
    queryKey: donorsQueryKey(authToken || ""),
    queryFn: async () => {
      const res = await fetch("/api/ssddonor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenNo: authToken,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch services");
      }
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Unexpected response format");
      return result.data.map((s: ssdDonors) => ({
        value: s.DonorId,
        label: s.DonorName
      }));
    },
    enabled: !!authToken && !!patientInfo,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const handleDonorChange = (value: SingleValue<DonorOption>) => {
    setSelectedDonor(value);
  };

  const handleAddToList = () => {
    if (!selectedDonor) return;
    if (amount <= 0) return;


    const newEstimate: EstimateInfo = {
      DonorName: selectedDonor.label,
      DonorCode: Number(selectedDonor.value),
      amount: amount,
      remarks: remarks,
    };
    setTableSsdReferData((prevData) => [...prevData, newEstimate]);
    setSelectedDonor(null);
    setAmount(0);
    setRemarks("");
  }

  const handleRemoveRow = (index: number) => {
    setTableSsdReferData((prevData) => prevData.filter((_, i) => i !== index));
  }

  const handleEdit = (index: number) => {
    const itemToEdit = tableSsdReferData[index];
    const donorOption = donors.find(s => Number(s.value) === itemToEdit.DonorCode) || null;
    setSelectedDonor(donorOption);
    setAmount(itemToEdit.amount);
    setRemarks(itemToEdit.remarks);
    setTableSsdReferData((prevData) => prevData.filter((_, i) => i !== index));
  }

  const handleSaveSsdEstimate = async () => {
    if (tableSsdReferData.length === 0) {
      alert("No estimate items to save.");
    } else {
      debugger
      const referDetails: SsdReferDetails[] = tableSsdReferData.map(item => ({
        donorCode: Number(item.DonorCode),
        amount: item.amount,
        remarks: item.remarks,
      }));
      const payload: SsdReferRequest = {
        patientCode: parseInt(patientCode),
        patientRegCode: parseInt(patientOpdCode),
        patientReferId: parseInt(estimateId),
        totalAmount: referDetails.reduce((sum, item) => sum + item.amount, 0),
        isVerified: 0,
        referDetails: referDetails,
      }
      try {
        const res = await fetch("/api/ssdrefer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenNo: authToken, data: payload
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to save SSD estimate");
        }
        const result = await res.json();
        if (!result.success) throw new Error(result.message || "Failed to save SSD estimate");
        alert("Estimate saved successfully.");
        router.push("/ssd-refer");
      } catch {
        alert("An error occurred while saving the estimate.");
      }
    }
  }

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
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Patient Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Patient Number</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white">{patientInfo?.PatientCode}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              {patientInfo?.FirstName} {patientInfo?.LastName}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Contact / Faculty</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white">{patientInfo?.FacultyName || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Age / Sex</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              {patientInfo?.Age} / {patientInfo?.Sex}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Department</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white">{patientInfo?.FacultyName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Consultant</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white">{patientInfo?.consultant || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Reffer SSD</h2>
          <Button size="sm" variant="success" onClick={handleSaveSsdEstimate}>Save</Button>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/5 dark:bg-white/3">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[275.5px] min-h-[45vh] max-h-[60vh]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/5 sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
                  <TableRow>
                    {["SSD Title", "Amount", "Remarks", "Action"].map((header) => (
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
                  <TableRow className="sticky top-10 bg-gray-50 dark:bg-gray-800 z-10">
                    <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <SearchSelect
                        options={donors}
                        isLoading={donorsLoading}
                        isSearchable={true}
                        value={selectedDonor}
                        onChange={handleDonorChange}
                        placeholder="Select a Donor..."
                      />
                    </TableCell>
                    <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <Input
                        placeholder="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      />
                    </TableCell>
                    <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <Input
                        placeholder="remarks"
                        type="text"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <Button size="sm" variant="primary" onClick={handleAddToList}>
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                  {tableSsdReferData && tableSsdReferData.map((refer, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {refer.DonorName}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {refer.amount}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {refer.remarks}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleRemoveRow(index)}>
                          <TrashBinIcon />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(index)}>
                          <PencilIcon />
                        </Button>
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