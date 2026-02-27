"use client";

import { useAuthToken } from "@/context/AuthContext";
import { useEffect, useState } from "react";

interface Props {
  Patientcode: string;
}

interface ServiceEntry {
  code: string;
  name: string;
  rate: number;
  qty: number;
  remarks: string;
  amount?: number;
  Alias?: string;
  DeptCode?: number;
  AcCode?: number;
  isRateChangeable?: boolean;
  Taxable?: boolean;
  DefaultDisburseConsultant?: number;
  CenterId?: number;
  IsDonorBase?: boolean;
  IsNotWorkList?: boolean;
}

interface SavedService {
  Fiscalyear: string;
  TranNo: number;
  Sno: number;
  ServiceCode: number;
  ServiceName: string;
  DeptCode: number;
  Rate: number;
  Discount: number;
  Qty: number;
  Amount: number;
  TaxAmt: number;
  Remarks: string;
  C_datetime: string;
  centercode: number;
}

const ServiceComponent: React.FC<Props> = ({ Patientcode }) => {
  const { authToken } = useAuthToken();

  const [masterData, setMasterData] = useState<any>(null);
  const [serviceType, setServiceType] = useState<number | "">("");
  const [serviceEntry, setServiceEntry] = useState<ServiceEntry>({
    code: "",
    name: "",
    rate: 0,
    qty: 1,
    remarks: "",
  });
  const [services, setServices] = useState<ServiceEntry[]>([]);
  const [savedServices, setSavedServices] = useState<SavedService[]>([]);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  
  // Transaction details
  const [currentTranNo, setCurrentTranNo] = useState<number | null>(null);
  const [fiscalYear, setFiscalYear] = useState<string>("2025/2026");
  const [centerCode, setCenterCode] = useState<number>(1);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isTranNoInitialized, setIsTranNoInitialized] = useState(false);

  // Load patient info from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem("selectedPatient");
    if (stored) setPatientInfo(JSON.parse(stored));
  }, []);

  // Get next TranNo only once on component mount
  useEffect(() => {
    if (!isTranNoInitialized) {
      fetchNextTranNo();
    }
  }, [isTranNoInitialized]);

  // Load saved services when TranNo is set
  useEffect(() => {
    if (currentTranNo && isTranNoInitialized) {
      fetchSavedServices();
    }
  }, [currentTranNo, isTranNoInitialized]);

  // Load master data from API
  useEffect(() => {
    fetch(`/api/masters/servicemaster`)
      .then((res) => res.json())
      .then((data) => {
        setMasterData(data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Filter services when service type changes
  useEffect(() => {
    if (serviceType !== "" && masterData?.services) {
      const filtered = masterData.services.filter(
        (s: any) => s.ServiceType === serviceType
      );
      setFilteredServices(filtered);
      
      setServiceEntry({
        code: "",
        name: "",
        rate: 0,
        qty: 1,
        remarks: "",
      });
    } else {
      setFilteredServices([]);
    }
  }, [serviceType, masterData]);

  // Auto-fill other fields when service code changes
  useEffect(() => {
    if (serviceEntry.code && masterData?.services) {
      const selected = masterData.services.find(
        (s: any) => s.ServiceCode.toString() === serviceEntry.code
      );
      if (selected) {
        setServiceEntry((prev) => ({
          ...prev,
          name: selected.ServiceName || "",
          rate: parseFloat(selected.Cost) || 0,
          Alias: selected.Alias,
          DeptCode: selected.DeptCode,
          AcCode: selected.AcCode,
          isRateChangeable: selected.isRateChangeable,
          Taxable: selected.Taxable,
          DefaultDisburseConsultant: selected.DefaultDisburseConsultant,
          CenterId: selected.CenterId,
          IsDonorBase: selected.IsDonorBase,
          IsNotWorkList: selected.IsNotWorkList,
        }));
      }
    }
  }, [serviceEntry.code, masterData]);

  const fetchNextTranNo = async () => {
    try {
      const res = await fetch(`/api/patient/patientservice?action=nextTranNo&fiscalYear=${fiscalYear}`);
      const data = await res.json();
      if (data.success) {
        setCurrentTranNo(data.tranNo);
        setIsTranNoInitialized(true);
      }
    } catch (err) {
      console.error("Error fetching next TranNo:", err);
    }
  };

  const fetchSavedServices = async () => {
    if (!currentTranNo) return;
    
    setIsLoadingServices(true);
    try {
      const res = await fetch(`/api/patient/patientservice?tranNo=${currentTranNo}&fiscalYear=${fiscalYear}`);
      const data = await res.json();
      if (data.success) {
        setSavedServices(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching saved services:", err);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const handleAddService = () => {
    if (!serviceEntry.code || !serviceEntry.name) {
      alert("Please select a service code");
      return;
    }
    const amount = serviceEntry.rate * serviceEntry.qty;
    setServices([...services, { ...serviceEntry, amount }]);
    
    setServiceEntry({
      code: "",
      name: "",
      rate: 0,
      qty: 1,
      remarks: "",
    });
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleSaveServices = async () => {
    if (services.length === 0) {
      alert("No services to save");
      return;
    }
    
    if (!currentTranNo) {
      alert("Transaction number not available");
      return;
    }
    
    try {
      const payload = services.map((s, index) => {
        const serviceData: any = {
          Fiscalyear: fiscalYear,
          TranNo: currentTranNo,
          Sno: savedServices.length + index + 1,
          ServiceCode: parseInt(s.code),
          Rate: parseFloat(s.rate.toString()),
          Discount: 0,
          Qty: parseInt(s.qty.toString()),
          Amount: parseFloat((s.qty * s.rate).toString()),
          TaxAmt: 0,
          C_datetime: new Date().toISOString(),
          centercode: centerCode,
        };

        if (s.DeptCode) {
          serviceData.DeptCode = s.DeptCode;
        }
        
        if (s.remarks && s.remarks.trim() !== "") {
          serviceData.Remarks = s.remarks.trim();
        }

        return serviceData;
      });

      const res = await fetch("/api/patient/patientservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await res.text();
        console.error("Non-JSON response:", textResponse);
        throw new Error(`Server returned non-JSON response`);
      }

      const data = await res.json();
      
      if (data.success) {
        alert("Services saved successfully!");
        setServices([]);
        setServiceType("");
        await fetchSavedServices();
      } else {
        alert("Error saving services: " + data.error);
        console.error("Save error details:", data);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving services: " + (err as Error).message);
    }
  };

  const handleServiceTypeChange = (value: string) => {
    setServiceType(value === "" ? "" : parseInt(value));
  };

  const handleFiscalYearChange = (newFiscalYear: string) => {
    if (savedServices.length > 0) {
      if (!confirm("Changing fiscal year will clear current data. Are you sure?")) {
        return;
      }
    }
    setFiscalYear(newFiscalYear);
    setServices([]);
    setSavedServices([]);
    setIsTranNoInitialized(false);
  };

  const handleNewTransaction = () => {
    if (services.length > 0 || savedServices.length > 0) {
      if (!confirm("This will clear current data and start a new transaction. Are you sure?")) {
        return;
      }
    }
    setServices([]);
    setSavedServices([]);
    setServiceType("");
    setIsTranNoInitialized(false);
  };

  const getTotalAmount = () => {
    return savedServices.reduce((sum, s) => sum + parseFloat(s.Amount.toString()), 0);
  };

  return (
    <div className="space-y-6 max-w-full mx-auto">
      {/* Patient Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <span className="font-semibold">Tran Id:</span> {currentTranNo || "Loading..."}
        </div>
        <div>
          <span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}
        </div>
        <div>
          <span className="font-semibold">Fiscal Year:</span>
          <select 
            className="ml-2 border rounded px-2 py-1"
            value={fiscalYear}
            onChange={(e) => handleFiscalYearChange(e.target.value)}
          >
            <option>2024/2025</option>
            <option>2025/2026</option>
            <option>2026/2027</option>
          </select>
        </div>
        <div>
          <span className="font-semibold">Center Code:</span>
          <input 
            type="number"
            className="ml-2 border rounded px-2 py-1 w-20"
            value={centerCode}
            onChange={(e) => setCenterCode(parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={handleNewTransaction}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
        >
          New Transaction
        </button>
      </div>

      {/* Service Entry Form */}
      <div className="bg-white border rounded-xl shadow p-4 space-y-4">
        <h2 className="font-semibold text-gray-700 mb-2">Please enter Service details</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          {/* Service Type */}
          <div className="col-span-1">
            <label className="text-sm text-gray-500">Service Type</label>
            <select
              className="input-field w-full"
              value={serviceType}
              onChange={(e) => handleServiceTypeChange(e.target.value)}
            >
              <option value="">Select Type</option>
              {masterData?.serviceTypes?.map((type: any, i: number) => (
                <option key={i} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Service Code */}
          <div className="col-span-1">
            <label className="text-sm text-gray-500">Service Code</label>
            <select
              className="input-field w-full"
              value={serviceEntry.code}
              onChange={(e) => setServiceEntry({ ...serviceEntry, code: e.target.value })}
              disabled={serviceType === ""}
            >
              <option value="">Select Service</option>
              {filteredServices.map((s: any, i: number) => (
                <option key={i} value={s.ServiceCode}>
                  {s.ServiceCode} - {s.ServiceName}
                </option>
              ))}
            </select>
          </div>

          {/* Service Name */}
          <div className="col-span-2">
            <label className="text-sm text-gray-500">Service Name</label>
            <input
              type="text"
              className="input-field w-full bg-gray-100"
              value={serviceEntry.name}
              readOnly
            />
          </div>

          {/* Rate */}
          <div>
            <label className="text-sm text-gray-500">Rate</label>
            <input
              type="number"
              className="input-field w-full"
              value={serviceEntry.rate}
              onChange={(e) =>
                setServiceEntry({ ...serviceEntry, rate: parseFloat(e.target.value) || 0 })
              }
              step="0.01"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="text-sm text-gray-500">Qty</label>
            <input
              type="number"
              className="input-field w-full"
              value={serviceEntry.qty}
              onChange={(e) =>
                setServiceEntry({ ...serviceEntry, qty: parseInt(e.target.value) || 1 })
              }
              min="1"
            />
          </div>

          {/* Remarks */}
          <div className="col-span-2">
            <label className="text-sm text-gray-500">Remarks</label>
            <input
              type="text"
              className="input-field w-full"
              value={serviceEntry.remarks}
              onChange={(e) =>
                setServiceEntry({ ...serviceEntry, remarks: e.target.value })
              }
            />
          </div>

          {/* Add Button */}
          <div className="col-span-1 md:col-span-6 flex justify-end">
            <button
              onClick={handleAddService}
              className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Pending Services Table */}
      {services.length > 0 && (
        <div className="bg-white border rounded-xl shadow overflow-x-auto">
          <div className="bg-yellow-50 px-4 py-2 border-b">
            <h3 className="font-semibold text-gray-700">Pending Services (Not Saved)</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-yellow-100 text-gray-700">
              <tr>
                {["Code", "Service Name", "Quantity", "Rate", "Amount", "Remarks", "Action"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-sm font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((s, i) => (
                <tr key={i} className="hover:bg-yellow-50 transition">
                  <td className="px-4 py-2">{s.code}</td>
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">{s.qty}</td>
                  <td className="px-4 py-2">{s.rate.toFixed(2)}</td>
                  <td className="px-4 py-2">{(s.qty * s.rate).toFixed(2)}</td>
                  <td className="px-4 py-2">{s.remarks}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleRemoveService(i)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 bg-yellow-50 border-t flex justify-end">
            <button
              onClick={handleSaveServices}
              className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
            >
              Save All Services
            </button>
          </div>
        </div>
      )}

      {/* Saved Services Table */}
      <div className="bg-white border rounded-xl shadow overflow-x-auto">
        <div className="bg-blue-50 px-4 py-2 border-b flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">Saved Services</h3>
          <button
            onClick={fetchSavedServices}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={isLoadingServices}
          >
            {isLoadingServices ? "Loading..." : "Refresh"}
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-600 text-white">
            <tr>
              {["S.No", "Code", "Service Name", "Quantity", "Rate", "Discount", "Amount", "Tax", "Remarks", "Date"].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-sm font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {savedServices.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-gray-400">
                  No services saved yet
                </td>
              </tr>
            ) : (
              savedServices.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2">{s.Sno}</td>
                  <td className="px-4 py-2">{s.ServiceCode}</td>
                  <td className="px-4 py-2">{s.ServiceName}</td>
                  <td className="px-4 py-2">{s.Qty}</td>
                  <td className="px-4 py-2">{parseFloat(s.Rate.toString()).toFixed(2)}</td>
                  <td className="px-4 py-2">{parseFloat(s.Discount.toString()).toFixed(2)}</td>
                  <td className="px-4 py-2">{parseFloat(s.Amount.toString()).toFixed(2)}</td>
                  <td className="px-4 py-2">{parseFloat(s.TaxAmt.toString()).toFixed(2)}</td>
                  <td className="px-4 py-2">{s.Remarks || "-"}</td>
                  <td className="px-4 py-2">{new Date(s.C_datetime).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
          {savedServices.length > 0 && (
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={6} className="px-4 py-2 text-right font-semibold">Total:</td>
                <td className="px-4 py-2 font-semibold">{getTotalAmount().toFixed(2)}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default ServiceComponent;