"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Select from "@/components/form/Select";
import SearchSelect, { SingleValue } from "react-select";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthToken } from "@/context/AuthContext";
import { inPatientResponse, patientResponse } from "@/types/patient.type";
import { ServiceResponse, ServiceTypeResponse } from "@/types/service.type";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { SsdEstimateDetails } from "@/types/estimate.type";

interface ServiceOption {
  value: string;
  label: string;
  serviceType: string;
  serviceRate: string;
}

interface ServiceTypeOption {
  value: string;
  label: string;
}

interface NormalizedPatient{
  patientCode: string;
  name: string;
  age: string;
  sex?: string;
  mobile: string;
  consultant?: string;
  facultyName?: string;
  admissionNo?: string;
  ipdCode?: number;
  ward?: string;
  bedNo?: string;
}

const patientQueryKeys = {
  detail: (patientCode: string, patientOpdCode: string) => ["patient", patientCode, patientOpdCode],
};
const patientEstimateDetailsQueryKeys = {
  detail: (patientCode: string, patientOpdCode: string) => ["patientEstimateDetails", patientCode, patientOpdCode],
};
const serviceTypesQueryKey = (patientCategory: number | undefined) => ["serviceTypes", patientCategory];
const servicesQueryKey = (patientCategory: number | undefined) => ["services", patientCategory];

interface SsdReferToPatientProps {
    patientInfo: patientResponse;
}

export default function SsdReferToPatientPage({ patientInfo }: SsdReferToPatientProps) {
  const params = useParams();
  const router = useRouter();
  const { authToken } = useAuthToken();
  const { patientCode, patientRegCode } = params as {
    patientCode: string;
    patientRegCode: string;
  };

  const [selectedServiceType, setSelectedServiceType] = useState<string>("");
  const [selectedService, setSelectedService] = useState<SingleValue<ServiceOption> | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [remarks, setRemarks] = useState<string>("");
  const [patientState, setPatientState] = useState<inPatientResponse | null>(null);

 


  useEffect(() => {
    if(!patientInfo){
      const stored = sessionStorage.getItem('selectedPatient');
      if(stored) setPatientState(JSON.parse(stored));
    }
  },[patientInfo])

   const effectivePatient: NormalizedPatient = useMemo(() => {
  if (patientInfo) {
    // OPD patient
    return {
      patientCode: patientInfo.PatientCode,
      name: `${patientInfo.FirstName} ${patientInfo.LastName}`,
      age: patientInfo.Age,
      sex: patientInfo.Sex || "N/A",
      mobile: patientInfo.Mobile,
      consultant: patientInfo.consultant,
      facultyName: patientInfo.FacultyName,
      admissionNo: patientInfo.AdmissionNo,
    };
  } else if (patientState) {
    // IPD patient
    return {
      patientCode: patientState.PatientCode,
      name: patientState.patientname, // single string
      age: patientState.Age,
      sex: "N/A", // IPD has no sex field
      mobile: patientState.Mobile,
      consultant: patientState.Gphreporting || "N/A",
      facultyName: patientState.wardName || "N/A",
      admissionNo: String(patientState.IPDCODE),
      ward: patientState.wardName || "",
      bedNo: patientState.bedno || "",
      ipdCode: patientState.IPDCODE,
    };
  }
  return {} as NormalizedPatient;
}, [patientInfo, patientState]);


  const {
    data: patientDetails,
    isLoading: patientLoading,
    isError: patientError,
    error: patientErrorObj,
  } = useQuery<patientResponse , Error>({
    // queryKey: patientQueryKeys.detail(patientCode, patientRegCode),
    queryKey: ["patient", patientCode, patientRegCode],
    queryFn: async () => {
      const res = await fetch("/api/patient/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenNo: authToken, data: { patientRegCode, patientCode } }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch patient info");
      }
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Unexpected response format");
      return result.data;
    },
    enabled: !!authToken && !!patientCode && !!patientRegCode,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });


  const {
    data: initialTableEstimateData = [],
    isLoading: tableEstimateIsLoading,
    isError: tableEstimateIsError,
    error: tableEstimateError,
  } = useQuery<SsdEstimateDetails[], Error>({
    queryKey: patientEstimateDetailsQueryKeys.detail(patientCode, patientRegCode),
    queryFn: async () => {
      const res = await fetch("/api/ssdestimate/estimateddetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenNo: authToken, data: { opdCode: patientRegCode, patientCode } }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch patient estimate data");
      }
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Unexpected response format");
      return result.data;
    },
    enabled: !!authToken && !!patientCode && !!patientRegCode,
    retry: false,
  });

  const [tableEstimateData, setTableEstimateData] = useState<SsdEstimateDetails[]>([]);

  useMemo(() => {
    if (initialTableEstimateData.length > 0) {
      setTableEstimateData(initialTableEstimateData);
    }
  }, [initialTableEstimateData]);

  const {
    data: serviceTypes = [],
  } = useQuery<ServiceTypeOption[], Error>({
    queryKey: serviceTypesQueryKey(patientInfo?.PatientCategory),
    queryFn: async () => {
      const res = await fetch("/api/service/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenNo: authToken, data: null }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch service types");
      }
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Unexpected service types response");
      return result.data.map((type: ServiceTypeResponse) => ({
        value: type.typeId,
        label: type.typeName,
      }));
    },
    enabled: !!authToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: allServices = [],
    isLoading: servicesLoading,
  } = useQuery<ServiceOption[], Error>({
    queryKey: servicesQueryKey(patientInfo?.PatientCategory),
    queryFn: async () => {
      const res = await fetch("/api/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenNo: authToken,
          data: { patientCategory: patientInfo?.PatientCategory || 0 }
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch services");
      }
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Unexpected response format");
      return result.data.map((s: ServiceResponse) => ({
        value: s.ServiceCode,
        label: s.ServiceName,
        serviceType: s.ServiceType,
        serviceRate: s.Rate,
      }));
    },
    enabled: !!authToken && !!patientInfo,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const effectiveServiceType = useMemo(() => {
    if (selectedServiceType) return selectedServiceType;
    if (serviceTypes.length > 0) return serviceTypes[0].value;
    return "";
  }, [selectedServiceType, serviceTypes]);

  const filteredServices = useMemo(() => {
    return allServices.filter((s) => s.serviceType == effectiveServiceType);
  }, [allServices, effectiveServiceType]);

  const computedAmount = useMemo(() => {
    const rate = selectedService?.serviceRate ? parseFloat(selectedService.serviceRate) : 0;
    return quantity * rate;
  }, [quantity, selectedService]);

  const handleServiceTypeChange = (value: string) => {
    setSelectedServiceType(value);
    setSelectedService(null);
  };

  const handleServiceChange = (newValue: SingleValue<ServiceOption>) => {
    setSelectedService(newValue);
  };

  const handleAddToList = () => {
    if (!selectedService) return;

    const newEstimate: SsdEstimateDetails = {
      serviceType: serviceTypes.find(st => st.value == effectiveServiceType)?.label || "",
      serviceTypeCode: Number(effectiveServiceType),
      serviceName: selectedService.label,
      serviceCode: Number(selectedService.value),
      quantity: quantity,
      rate: Number(selectedService.serviceRate),
      amount: computedAmount,
      remarks: remarks,
    };

    setTableEstimateData((prevData) => [...prevData, newEstimate]);
    // Reset inputs
    setSelectedService(null);
    setQuantity(1);
    setRemarks("");
  }

  const handleRemoveRow = (index: number) => {
    setTableEstimateData((prevData) => prevData.filter((_, i) => i !== index));
  }

  const handleEdit = (index: number) => {
    const itemToEdit = tableEstimateData[index];
    const serviceOption = allServices.find(s => s.value == String(itemToEdit.serviceCode)) || null;
    setSelectedServiceType(String(itemToEdit.serviceTypeCode));
    setSelectedService(serviceOption);
    setQuantity(itemToEdit.quantity);
    setRemarks(itemToEdit.remarks);
    setTableEstimateData((prevData) => prevData.filter((_, i) => i !== index));
  }

  const handleSaveSsdEstimate = async () => {
    if (tableEstimateData.length == 0) {
      alert("No estimate items to save.");
    } else {
      const estimateDetails = tableEstimateData.map(item => ({
        serviceTypeCode: Number(item.serviceTypeCode),
        serviceCode: Number(item.serviceCode),
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        amount: Number(item.amount),
        remarks: item.remarks,
      }));
      const payload = {
        patientCode: patientCode,
        patientRegCode: patientRegCode,
        totalAmount: estimateDetails.reduce((sum, item) => sum + item.amount, 0),
        isVerified: 0,
        estimateDetails: estimateDetails,
      }
      try {
        const res = await fetch("/api/ssdestimate", {
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
        router.push("/ssd-estimate");
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
            <p className="text-sm font-medium text-gray-800 dark:text-white">{effectivePatient.patientCode}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              {effectivePatient.name}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Contact / Faculty</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white">{effectivePatient.facultyName || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Age / Sex</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              {effectivePatient.age} / {effectivePatient.sex}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Department</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white">{effectivePatient.facultyName} {effectivePatient.ward}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Consultant</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white">{effectivePatient.consultant || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Generate Estimate</h2>
          <Button size="sm" variant="success" onClick={handleSaveSsdEstimate}>Save</Button>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/5 dark:bg-white/3">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[275.5px] min-h-[45vh] max-h-[60vh]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/5 sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
                  <TableRow>
                    {["Type", "Service", "Quantity", "Rate", "Amount", "Remarks", "Action"].map((header) => (
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
                      <Select
                        options={serviceTypes}
                        defaultValue={effectiveServiceType}
                        onChange={handleServiceTypeChange}
                        placeholder="Select a service type"
                        isPlaceHolderRequired={false}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <SearchSelect
                        options={filteredServices}
                        isLoading={servicesLoading}
                        isSearchable={true}
                        value={selectedService}
                        onChange={handleServiceChange}
                        placeholder="Select a service..."
                      />
                    </TableCell>
                    <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <Input
                        placeholder="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                      />
                    </TableCell>
                    <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <Input
                        placeholder="rate"
                        type="number"
                        disabled={true}
                        value={selectedService?.serviceRate || ""}
                      />
                    </TableCell>
                    <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <Input
                        placeholder="amount"
                        type="number"
                        disabled={true}
                        value={computedAmount.toFixed(2)}
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
                  {tableEstimateData && tableEstimateData.map((estimate, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {estimate.serviceType}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {estimate.serviceName}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {estimate.quantity}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {estimate.rate}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {estimate.amount}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {estimate.remarks}
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