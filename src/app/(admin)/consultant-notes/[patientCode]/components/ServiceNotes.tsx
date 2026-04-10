'use client';

import { useAuthToken } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import {
  Stethoscope, Plus, RefreshCw, Trash2, Save,
  Hash, Calendar, Building2, ReceiptText, AlertCircle,
} from "lucide-react";
import { useServiceRequest } from "../queries/servicerequest.queries";

interface Props { Patientcode: string }

interface ServiceEntry {
  code: string;
  name: string;
  rate: number;
  qty: number;
  remarks: string;
  amount?: number;
  Alias?: string;
  DeptCode?: number;
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

const inputClass = `
  w-full px-2.5 py-1.5 rounded-lg text-xs
  border border-slate-200 dark:border-slate-700
  bg-white dark:bg-slate-800
  text-slate-800 dark:text-slate-200
  placeholder:text-slate-300 dark:placeholder:text-slate-600
  focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-all duration-150
`;

const selectClass = `${inputClass} cursor-pointer`;

const ServiceComponent: React.FC<Props> = ({ Patientcode }) => {
  const { authToken } = useAuthToken();
  const [patientInfo, setPatientInfo] = useState<any>(null);
  useEffect(() => {
      const stored = sessionStorage.getItem("selectedPatient");
      if (stored) setPatientInfo(JSON.parse(stored));
    }, []);

  const patientId   = patientInfo?.MRNo || patientInfo?.PatientCode || patientInfo?.Mrno;
  const patientNo   = patientInfo?.TokenNo || patientInfo?.IPDCODE;
  const regCode     = patientInfo?.RegNo || patientInfo?.RegCode;


  // react query to fetch the service request data of this patient
  const {data: serviceRequest, isFetching} = useServiceRequest(authToken, patientId);
  console.log("serviceRequest", serviceRequest);

  const [masterData, setMasterData] = useState<any>(null);
  const [rateType, setRateType] = useState<any[]>([]);
  const [selectedRateType, setSelectedRateType] = useState<number | "">("");
  const [serviceType, setServiceType] = useState<number | "">("");
  const [serviceEntry, setServiceEntry] = useState<ServiceEntry>({
    code: "", name: "", rate: 0, qty: 1, remarks: ""
  });
  const [services, setServices] = useState<ServiceEntry[]>([]);
  const [savedServices, setSavedServices] = useState<SavedService[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [currentTranNo, setCurrentTranNo] = useState<number | null>(null);
  const [fiscalYear, setFiscalYear] = useState("2082/83");
  const [centerCode, setCenterCode] = useState(1);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isTranNoInitialized, setIsTranNoInitialized] = useState(false);
  const [isFetchingRate, setIsFetchingRate] = useState(false);

  // Fetch Service Types
  useEffect(() => {
    fetch("/api/patient/patientservice/type")
      .then(res => res.json())
      .then(data => {
        if (data.success) setMasterData(data.data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`/api/patient/patientservice/ratetype`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setRateType(data.data);
      })
      .catch(console.error);
  }, []);

  // Fetch services by type
  useEffect(() => {
    if (serviceType !== "") {
      fetch(`/api/patient/patientservice/master?serviceTypeId=${serviceType}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setFilteredServices(data.data || []);
        })
        .catch(console.error);

      setServiceEntry({ code: "", name: "", rate: 0, qty: 1, remarks: "" });
    } else {
      setFilteredServices([]);
    }
  }, [serviceType]);

  // Auto-fill name + fetch rate when service is selected
  useEffect(() => {
    if (!serviceEntry.code) return;

    const selected = filteredServices.find(
      (s: any) => s.ServiceCode.toString() === serviceEntry.code
    );

    if (selected) {
      setServiceEntry(prev => ({
        ...prev,
        name: selected.ServiceName || "",
        Alias: selected.Alias,
        DeptCode: selected.DeptCode,
      }));

      // Auto fetch rate
      fetchRate(parseInt(serviceEntry.code));
    }
  }, [serviceEntry.code, filteredServices]);

  // Fetch Rate Function
  const fetchRate = async (serviceCode: number) => {
    if (!serviceCode) return;

    setIsFetchingRate(true);
    try {
      const res = await fetch(
        `/api/patient/patientservice/rate?serviceCode=${serviceCode}&rateType=1`
      );
      const data = await res.json();

      if (data.success) {
        setServiceEntry(prev => ({
          ...prev,
          rate: Number(data.rate) || 0
        }));
      } else {
        setServiceEntry(prev => ({ ...prev, rate: 0 }));
      }
    } catch (error) {
      console.error("Error fetching rate:", error);
      setServiceEntry(prev => ({ ...prev, rate: 0 }));
    } finally {
      setIsFetchingRate(false);
    }
  };

  // Fetch Next TranNo
  const fetchNextTranNo = async () => {
    try {
      const res = await fetch(`/api/patient/patientservice/invoice?action=nextTranNo&fiscalYear=${fiscalYear}`);
      const data = await res.json();
      if (data.success) {
        setCurrentTranNo(data.tranNo);
        setIsTranNoInitialized(true);
      }
    } catch (e) {
      console.error("Failed to fetch next TranNo", e);
    }
  };

  useEffect(() => {
    if (!isTranNoInitialized) fetchNextTranNo();
  }, [isTranNoInitialized]);

  // Fetch Saved Services
  const fetchSavedServices = async () => {
    if (!currentTranNo) return;
    setIsLoadingServices(true);
    try {
      const res = await fetch(
        `/api/patient/patientservice/invoice?tranNo=${currentTranNo}&fiscalYear=${fiscalYear}`
      );
      const data = await res.json();
      if (data.success) setSavedServices(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingServices(false);
    }
  };

  useEffect(() => {
    if (currentTranNo && isTranNoInitialized) fetchSavedServices();
  }, [currentTranNo, isTranNoInitialized]);

  const handleAddService = () => {
    if (!serviceEntry.code || !serviceEntry.name) {
      alert("Please select a service");
      return;
    }
    setServices(prev => [...prev, { ...serviceEntry, amount: serviceEntry.rate * serviceEntry.qty }]);
    setServiceEntry({ code: "", name: "", rate: 0, qty: 1, remarks: "" });
  };

  const handleSaveServices = async () => {
    if (!services.length) return alert("No services to save");
    if (!currentTranNo) return alert("Transaction number not available");

    try {
      const totalAmount = services.reduce((sum, s) => sum + s.rate * s.qty, 0);
      const dateStr = new Date().toISOString().split("T")[0];

      // Step 1 - Insert master row
      const masterPayload = {
       TranNo: currentTranNo,
       FiscalYear: fiscalYear,
       PatientCode: patientId,
       OPDCode: regCode,
       Amount: totalAmount,
       DeptCode: services[0].DeptCode,
       CenterCode: 1,
       UserCode: patientInfo?.Tokenid,
       DATE_E: dateStr,
       DATE_N: dateStr,
       IsInvoiced: false,
       InvoiceNo: "",
       Remarks: "",
      };

      const masterRes = await fetch("/api/patient/patientservice/invoice/master", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(masterPayload),
      });

      const masterdata = await masterRes.json();
      if (!masterdata.success) {
        alert("Error saving master: " + (masterdata.error || "Unknown error"));
        return;
      }

      // Step 2 - Insert detail rows
      const detailPayload = services.map((s, i) => ({
        FiscalYear: fiscalYear,      
        TranNo: currentTranNo,
        Sno: savedServices.length + i + 1,
        ServiceCode: parseInt(s.code),
        DeptCode: s.DeptCode || 0,
        Rate: s.rate,
        Discount: 0,
        Qty: s.qty,
        Amount: s.qty * s.rate,
        TaxAmt: 0,
        Remarks: s.remarks?.trim() || "",
        C_datetime: new Date().toISOString(),
        centercode: 1,
      }));

      const detailRes = await fetch("/api/patient/patientservice/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(detailPayload),
      });

      const detailData = await detailRes.json();
      if (detailData.success) {
        alert("Services saved!");
        setServices([]);
        setServiceType("");
        setIsTranNoInitialized(false);   // get fresh TranNo next time
        await fetchSavedServices();
      }
    } catch (e) {
      alert("Error: " + (e as Error).message);
    }
  };

  const handleFiscalYearChange = (v: string) => {
    if ((services.length || savedServices.length) &&
        !confirm("Changing fiscal year will clear current data. Continue?")) return;

    setFiscalYear(v);
    setServices([]);
    setSavedServices([]);
    setIsTranNoInitialized(false);
  };

  const handleNewTransaction = () => {
    if ((services.length || savedServices.length) &&
        !confirm("This will clear all current data. Continue?")) return;

    setServices([]);
    setSavedServices([]);
    setServiceType("");
    setIsTranNoInitialized(false);
  };

  const totalSaved = savedServices.reduce((sum, r) => sum + parseFloat(r.Amount.toString()), 0);

  return (
    <div className="space-y-4">

      {/* Transaction Meta Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400" />
        <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <MetaChip icon={<Hash className="w-3 h-3" />} label="Tran No" value={currentTranNo ? `#${currentTranNo}` : "Loading…"} />
            <MetaChip icon={<Calendar className="w-3 h-3" />} label="Date" value={new Date().toLocaleDateString()} />

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-[10px]">
              <span className="text-slate-400 dark:text-slate-500"><Calendar className="w-3 h-3" /></span>
              <span className="text-slate-400 dark:text-slate-500">Fiscal Year:</span>
              <select
                value={fiscalYear}
                onChange={e => handleFiscalYearChange(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option>2082/83</option>
                <option>2083/84</option>
                <option>2084/85</option>
              </select>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-[10px]">
              <span className="text-slate-400 dark:text-slate-500"><Building2 className="w-3 h-3" /></span>
              <span className="text-slate-400 dark:text-slate-500">Center:</span>
              <input
                type="number"
                value={centerCode}
                onChange={e => setCenterCode(parseInt(e.target.value) || 1)}
                className="w-10 bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              />
            </div>
              <div>
              {/* <FieldLabel>Service Type</FieldLabel> */}
              <select
                className={selectClass}
                value={selectedRateType}
                onChange={e => setSelectedRateType(e.target.value === "" ? "" : parseInt(e.target.value))}
              >
                <option value="">Rate Type</option>
                {rateType?.map((t: any, i: number) => (
                  <option key={i} value={t.Code}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleNewTransaction}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> New Transaction
          </button>
        </div>
      </div>

      {/* Service Entry Form */}
      <TableCard icon={<Stethoscope className="w-4 h-4" />} title="Service Entry" color="blue">
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">

            {/* Service Type */}
            <div>
              <FieldLabel>Service Type</FieldLabel>
              <select
                className={selectClass}
                value={serviceType}
                onChange={e => setServiceType(e.target.value === "" ? "" : parseInt(e.target.value))}
              >
                <option value="">Select Type</option>
                {masterData?.map((t: any, i: number) => (
                  <option key={i} value={t.ServiceCode}>{t.ServiceType}</option>
                ))}
              </select>
            </div>

            {/* Service Selection */}
            <div>
              <FieldLabel>Service</FieldLabel>
              <select
                className={selectClass}
                value={serviceEntry.code}
                onChange={e => setServiceEntry({ ...serviceEntry, code: e.target.value })}
                disabled={serviceType === ""}
              >
                <option value="">Select Service</option>
                {filteredServices.map((s: any) => (
                  <option key={s.ServiceCode} value={s.ServiceCode}>
                    {s.ServiceCode} – {s.ServiceName}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Name */}
            <div className="col-span-2">
              <FieldLabel>Service Name</FieldLabel>
              <input type="text" className={`${inputClass} bg-slate-50 dark:bg-slate-700/40`} value={serviceEntry.name} readOnly />
            </div>

            {/* Rate */}
            <div>
              <FieldLabel>Rate {isFetchingRate && "(Loading...)"}</FieldLabel>
              <input
                type="number"
                className={inputClass}
                value={serviceEntry.rate}
                step="0.01"
                onChange={e => setServiceEntry({ ...serviceEntry, rate: parseFloat(e.target.value) || 0 })}
                disabled={isFetchingRate}
              />
            </div>

            {/* Qty */}
            <div>
              <FieldLabel>Qty</FieldLabel>
              <input
                type="number"
                className={inputClass}
                value={serviceEntry.qty}
                min="1"
                onChange={e => setServiceEntry({ ...serviceEntry, qty: parseInt(e.target.value) || 1 })}
              />
            </div>

            {/* Remarks */}
            <div className="col-span-2 md:col-span-4">
              <FieldLabel>Remarks</FieldLabel>
              <input
                type="text"
                className={inputClass}
                value={serviceEntry.remarks}
                placeholder="Optional…"
                onChange={e => setServiceEntry({ ...serviceEntry, remarks: e.target.value })}
              />
            </div>

            {/* Amount Preview */}
            <div className="col-span-2">
              <FieldLabel>Amount</FieldLabel>
              <div className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                Rs. {(serviceEntry.rate * serviceEntry.qty).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleAddService}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" /> Add Service
            </button>
          </div>
        </div>
      </TableCard>

      {/* Pending Services */}
      {services.length > 0 && (
        <TableCard icon={<AlertCircle className="w-4 h-4" />} title={`Pending — ${services.length} unsaved`} color="amber">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[580px]">
              <thead>
                <tr className="bg-amber-50/80 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-800/30">
                  {["Code", "Service Name", "Qty", "Rate", "Amount", "Remarks", ""].map((h, i) => (
                    <th key={i} className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 ${i >= 2 && i < 5 ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                {services.map((s, i) => (
                  <tr key={i} className="hover:bg-amber-50/40 dark:hover:bg-amber-900/10 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-slate-400">{s.code}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">{s.name}</td>
                    <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">{s.qty}</td>
                    <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">{s.rate.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-800 dark:text-slate-100">{(s.qty * s.rate).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-slate-400 dark:text-slate-500">{s.remarks || "—"}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => setServices(prev => prev.filter((_, idx) => idx !== i))}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-transparent hover:border-rose-200 dark:hover:border-rose-800/30 transition-all"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-amber-100 dark:border-amber-800/30 bg-amber-50/40 dark:bg-amber-900/10 flex justify-end">
            <button
              onClick={handleSaveServices}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900/40 transition-all"
            >
              <Save className="w-3.5 h-3.5" /> Save All Services
            </button>
          </div>
        </TableCard>
      )}

      {/* Saved Services */}
      {/* <TableCard 
        icon={<ReceiptText className="w-4 h-4" />} 
        title="Saved Services" 
        color="blue"
        action={
          <button 
            onClick={fetchSavedServices} 
            disabled={isLoadingServices}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`w-3 h-3 ${isLoadingServices ? "animate-spin" : ""}`} />
            {isLoadingServices ? "Loading…" : "Refresh"}
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[720px]">
            <thead>
              <tr className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-600">
                {["S.No", "Code", "Service Name", "Qty", "Rate", "Discount", "Amount", "Tax", "Remarks", "Date"].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white/75 ${i >= 3 && i <= 7 ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
              {savedServices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <ReceiptText className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">No services saved yet</p>
                    </div>
                  </td>
                </tr>
              ) : (
                savedServices.map((s, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                    <td className="px-4 py-2.5 text-slate-500 dark:text-slate-500">{s.Sno}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-slate-400">{s.ServiceCode}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">{s.ServiceName}</td>
                    <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">{s.Qty}</td>
                    <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">{parseFloat(s.Rate.toString()).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">{parseFloat(s.Discount.toString()).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-800 dark:text-slate-100">{parseFloat(s.Amount.toString()).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">{parseFloat(s.TaxAmt.toString()).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-slate-400 dark:text-slate-500">{s.Remarks || "—"}</td>
                    <td className="px-4 py-2.5 text-slate-400 dark:text-slate-500 whitespace-nowrap">{new Date(s.C_datetime).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
            {savedServices.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-blue-100 dark:border-blue-800/30 bg-blue-50/60 dark:bg-blue-900/10">
                  <td colSpan={6} className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Total Amount</td>
                  <td className="px-4 py-2.5 text-right text-sm font-extrabold text-blue-700 dark:text-blue-300">{totalSaved.toFixed(2)}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </TableCard> */}

      {/* Service Requests */}
      <TableCard 
        icon={<ReceiptText className="w-4 h-4" />} 
        title="Service Requests" 
        color="blue"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[720px]">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-blue-500">
                {["S.No", "Service Name", "Amount", "Requested By", "Date", "Remarks", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white/80 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
              {!serviceRequest || serviceRequest.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No service requests found
                  </td>
                </tr>
              ) : (
                serviceRequest.map((item, index) => {
                  const [tranId, date, patientId, requestedBy] =
                    item.trancodedaterequestby?.split(" | ") || [];

                  return (
                    <tr key={item.TRANID} className="hover:bg-amber-50/30 dark:hover:bg-amber-900/10">
                      <td className="px-4 py-2">{index + 1}</td>

                      <td className="px-4 py-2 font-medium">
                        {item.ServiceName}
                      </td>

                      <td className="px-4 py-2">
                        Rs. {item.Amount?.toLocaleString()}
                      </td>

                      <td className="px-4 py-2">
                        {requestedBy || item.requestby}
                      </td>

                      <td className="px-4 py-2">
                        {date ? new Date(date).toLocaleDateString() : "-"}
                      </td>

                      <td className="px-4 py-2 text-slate-400">
                        {item.Remarks || "—"}
                      </td>

                      <td className="px-4 py-2">
                        {item.Status === null ? (
                          <span className="text-amber-500">Pending</span>
                        ) : (
                          <span className="text-green-600">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </TableCard>
    </div>
  );
};

/* Helper Components */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{children}</label>;
}

function MetaChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-[10px]">
      <span className="text-slate-400 dark:text-slate-500">{icon}</span>
      <span className="text-slate-400 dark:text-slate-500">{label}:</span>
      <span className="font-semibold text-slate-700 dark:text-slate-300">{value}</span>
    </div>
  );
}

function TableCard({ icon, title, color = "blue", action, children }: {
  icon: React.ReactNode; 
  title: string; 
  color?: string;
  action?: React.ReactNode; 
  children: React.ReactNode;
}) {
  const tableColorMap: Record<string, { label: string; icon: string }> = {
    blue:  { label: "text-blue-600 dark:text-blue-400",   icon: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30" },
    amber: { label: "text-amber-600 dark:text-amber-400", icon: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30" },
  };
  const c = tableColorMap[color] ?? tableColorMap.blue;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border ${c.icon}`}>{icon}</span>
          <h2 className={`text-xs font-bold uppercase tracking-widest ${c.label}`}>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export default ServiceComponent;