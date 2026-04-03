"use client";

import { useAuthToken } from "@/context/AuthContext";
import { Pill, Calendar, Clock, Plus, X, Printer, Save, Trash2, Loader2, Search, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useMedicineList, usePrescriptionHistory } from "../queries/prescription.queries";
import { Medication, PrescriptionFormRequest } from "@/types/prescription.type";
import { usePrescriptionMaster } from "@/queries/master.queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";

interface MasterItem { Code: number; label: string }

/* ── shared input style ── */
const inputClass = `
  w-full px-2.5 py-1.5 rounded-lg text-xs
  border border-slate-200 dark:border-slate-700
  bg-white dark:bg-slate-800
  text-slate-800 dark:text-slate-200
  placeholder:text-slate-300 dark:placeholder:text-slate-600
  focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 dark:focus:border-teal-500
  transition-all duration-150
`;

const DURATION_CODE: Record<string, string> = {
  "Day(s)": "1", "Week(s)": "2", "Month(s)": "3"
}

const PrescriptionForm: React.FC<PrescriptionFormRequest> = ({
  patientCode, patientName, regNo, age, gender, doctorName, dept
}) => {
  const { authToken } = useAuthToken();

 const [patientInfo, setPatientInfo] = useState<any>(null);
  useEffect(() => {
      const stored = sessionStorage.getItem("selectedPatient");
      if (stored) setPatientInfo(JSON.parse(stored));
    }, []);
  const patientId   = patientInfo?.MRNo || patientInfo?.PatientCode || patientInfo?.Mrno;
  const patientNo   = patientInfo?.TokenNo || patientInfo?.IPDCODE;
  const regCode     = patientInfo?.RegNo || patientInfo?.RegCode;
  const patientname = patientInfo?.patientname || patientInfo?.PatientName || patientInfo?.PATIENTNAME;
  const doctorname = patientInfo?.BlockedBy || patientInfo?.CONSULTANT;

  const queryClient = useQueryClient();

  const [medications,          setMedications]          = useState<Medication[]>([]);
  const [activeTab,            setActiveTab]            = useState<"recent" | "backlog">("recent");
  const [drugName,             setDrugName]             = useState("");
  const [dose,                 setDose]                 = useState("");
  const [selectedFrequency,    setSelectedFrequency]    = useState("");
  const [selectedRoute,        setSelectedRoute]        = useState("");
  const [startDate,            setStartDate]            = useState(new Date().toISOString().split("T")[0]);
  const [duration,             setDuration]             = useState("");
  const [timePeriod,           setTimePeriod]           = useState("Day(s)");
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([]);
  const [remarks,              setRemarks]              = useState("");
  const [medicineSearch,       setMedicineSearch]       = useState("");
  const [filteredMedicines,    setFilteredMedicines]    = useState<any[]>([]);
  const [selectedMedicineId,   setSelectedMedicineId]   = useState<number | null>(null);
  const [selectedFreqCode,     setSelectedFreqCode]     = useState<number>(0);
  const [selectedRouteCode,     setSelectedRouteCode]     = useState<string>("");

  const { data: prescriptionHistory, isLoading: isHistoryLoading, refetch } = usePrescriptionHistory(authToken, patientId);
  const { data: masters,            isLoading: isMasterLoading }            = usePrescriptionMaster(authToken);
  const { data: drugs }                                                      = useMedicineList(authToken, patientId);

  console.log("drugs", drugs);

  const masterRoutes       = masters?.routes       ?? [];
  const masterFrequencies  = masters?.frequency    ?? [];
  const masterInstructions = masters?.instructions ?? [];

  useEffect(() => {
    if (!medicineSearch || !drugs) { setFilteredMedicines([]); return; }
    const q = medicineSearch.toLowerCase();
    setFilteredMedicines(drugs.filter((m: any) =>
      m.Name?.toLowerCase().includes(q) || m.Particular?.toLowerCase().includes(q)
    ).slice(0, 15));
  }, [medicineSearch, drugs]);

  const handleSearchMedicine = (med: any) => {
    setDrugName(med.Name); setMedicineSearch(med.Name);
    setSelectedMedicineId(med.itemid); setFilteredMedicines([]);
  };

  const handleClearForm = () => {
    setDrugName(""); setMedicineSearch(""); setSelectedMedicineId(null);
    setDose(""); setSelectedFrequency(""); setSelectedRoute("");
    setDuration(""); setRemarks(""); setSelectedInstructions([]);
    setSelectedFreqCode(0); setSelectedRouteCode("");
  };

  const handleAddMedication = () => {
    if (!drugName || !dose) return alert("Please enter Drug Name and Dose");
    if(!selectedMedicineId) return alert("Please select a drug from the dropdown list");

    setMedications(prev => [...prev, {
      id: Date.now().toString(),
      drugName, 
      dose,
      medicineId: selectedMedicineId,
      frequency: selectedFrequency,
      freqCode: selectedFreqCode, 
      route: selectedRoute,
      routeCode: selectedRouteCode,
      startDate, 
      duration, 
      durationCode: DURATION_CODE[timePeriod] ?? "1",
      timePeriod,
      instructions: selectedInstructions, remarks,
    }]);
    handleClearForm();
  };

  const toggleInstruction = (inst: string) =>
    setSelectedInstructions(prev => prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst]);


  const { mutateAsync: savePrescription, isPending: isSubmitting } = useMutation({
    mutationFn: async (med: Medication) => {
      const res = await fetch(`/api/patient/prescription/${patientCode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        UnkId: 0, PatientCode: patientId, RegNo: regCode,
        PrescriptionType: "Regular", DrugsCode: med.medicineId,
        Dose: parseFloat(med.dose.trim()), Frequency: med.freqCode,
        Route: med.routeCode, StartDate: med.startDate,
        Duration: Number(med.duration) || 1, DurationOn: med.duration,
        TotalQty: 0, Instruction: med.instructions.join(", "),
        AdditionalInstr: med.remarks, PatientName: patientname,
        Age: patientInfo?.Age, Gender: patientInfo?.Gender, DoctorName: doctorname,
        Dept: patientInfo?.FacultyName
      }),
    });
    if(!res.ok){
      const err = await res.json();
      throw new Error(err.message);
    }
    return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescription-history", patientCode] });
    },
    onError: (err: any) => {
      alert(err.message || "Error saving prescriptions.");
    },
  });

  const handleSubmit = async () => {
    if(!medications.length) return alert("Please add at least one medication");
    try{
      await Promise.all(medications.map(med => savePrescription(med)));
      toast.success("Prescriptions saved successfully!");
      setMedications([]);
    }catch{
      toast.error("Failed to save prescriptions.");
    }
  }

  return (
    <>
    <ToastContainer position="top-right"/>
    <div className="grid lg:grid-cols-2 gap-5">
      {/* ══════════════════════════════
          LEFT — Form panel
          ══════════════════════════════ */}
      <div className="space-y-4">
        {/* New Medication card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none overflow-hidden">
          <div className="h-0.5 w-full bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-400" />

          {/* Header */}
          <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/30">
                <Pill className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">New Medication</h2>
            </div>
            {isMasterLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />}
          </div>

          <div className="p-5 space-y-4">

            {/* Drug search */}
            <div className="relative">
              <FieldLabel>Drug Name *</FieldLabel>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="text" value={medicineSearch}
                  onChange={e => setMedicineSearch(e.target.value)}
                  placeholder="Search drugs…"
                  className={`${inputClass} pl-8`}
                />
              </div>
              {filteredMedicines.length > 0 && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                  {filteredMedicines.map((med: any) => (
                    <div key={med.itemid} onClick={() => handleSearchMedicine(med)}
                      className="px-3 py-2 text-xs cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/20 border-b border-slate-100 dark:border-slate-700/40 last:border-b-0 text-slate-700 dark:text-slate-300 transition-colors">
                      {med.Name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dose + Frequency */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Dose *</FieldLabel>
                <input type="text" value={dose} onChange={e => setDose(e.target.value)}
                  placeholder="e.g. 1 tab" className={inputClass} />
              </div>
              <div>
                <FieldLabel>Frequency</FieldLabel>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {masterFrequencies.map((f: any, i: number) => (
                    <ToggleBtn key={f.Code ?? i} active={selectedFrequency === f.label} onClick={() => {
                        setSelectedFrequency(f.label);
                        setSelectedFreqCode(f.Code);
                    }}
                    >
                      {f.label}
                    </ToggleBtn>
                  ))}
                </div>
              </div>
            </div>

            {/* Route */}
            <div>
              <FieldLabel>Route</FieldLabel>
              <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                {masterRoutes.map((r: any, i: number) => (
                  <ToggleBtn key={r.Code ?? i} active={selectedRoute === r.label} onClick={() => {
                    setSelectedRoute(r.label);
                    setSelectedRouteCode(r.Code);
                  }} block>
                    {r.label}
                  </ToggleBtn>
                ))}
              </div>
            </div>

            {/* Date + Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Start Date</FieldLabel>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
              </div>
              <div>
                <FieldLabel>Duration</FieldLabel>
                <div className="flex gap-1.5">
                  <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
                    placeholder="Qty" className={`${inputClass} w-16 text-center`} />
                  <select value={timePeriod} onChange={e => setTimePeriod(e.target.value)}
                    className={`${inputClass} flex-1`}>
                    <option>Day(s)</option>
                    <option>Week(s)</option>
                    <option>Month(s)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <FieldLabel>Instructions</FieldLabel>
              <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                {masterInstructions.map((inst: any, i: number) => (
                  <ToggleBtn key={inst.Code ?? i} active={selectedInstructions.includes(inst.label)}
                    onClick={() => toggleInstruction(inst.label)} color="blue" block>
                    {inst.label}
                  </ToggleBtn>
                ))}
              </div>
            </div>

            {/* Remarks */}
            <div>
              <FieldLabel>Remarks</FieldLabel>
              <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)}
                placeholder="Additional instructions…" className={inputClass} />
            </div>

            {/* Add button */}
            <button onClick={handleAddMedication} className="
              w-full py-2.5 rounded-xl text-xs font-semibold
              inline-flex items-center justify-center gap-1.5
              bg-teal-600 hover:bg-teal-700 text-white
              shadow-sm shadow-teal-200 dark:shadow-teal-900/40
              transition-all duration-150 active:scale-[0.98]
            ">
              <Plus className="w-3.5 h-3.5" /> Add to List
            </button>
          </div>
        </div>

        {/* Staging / pending medications */}
        {medications.length > 0 && (
          <div className="rounded-2xl border-2 border-dashed border-teal-200 dark:border-teal-800/40 bg-teal-50/40 dark:bg-teal-900/10 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-teal-100 dark:border-teal-800/30">
              <h3 className="text-xs font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400">
                Pending — {medications.length} unsaved
              </h3>
              <button onClick={() => setMedications([])}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 transition-colors">
                Discard All
              </button>
            </div>

            <div className="p-4 space-y-2">
              {medications.map(m => (
                <div key={m.id} className="
                  flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl
                  bg-white dark:bg-slate-800/60
                  border border-teal-100 dark:border-teal-800/30
                ">
                  <div>
                    <p className="text-xs font-bold text-teal-800 dark:text-teal-300">{m.drugName}</p>
                    <p className="text-[10px] text-teal-600 dark:text-teal-500 mt-0.5">
                      {m.dose}
                      {m.frequency && ` · ${m.frequency}`}
                      {m.duration && ` · ${m.duration} ${m.timePeriod}`}
                    </p>
                  </div>
                  <button onClick={() => setMedications(prev => prev.filter(x => x.id !== m.id))}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="px-4 pb-4">
              <button disabled={isSubmitting} onClick={handleSubmit} className="
                w-full py-2.5 rounded-xl text-xs font-semibold
                inline-flex items-center justify-center gap-1.5
                bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white
                shadow-sm shadow-blue-200 dark:shadow-blue-900/40
                transition-all duration-150
              ">
                {isSubmitting
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                  : <><Save className="w-3.5 h-3.5" /> Finalize & Save All</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════
          RIGHT — History panel
      ══════════════════════════════ */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none overflow-hidden flex flex-col h-fit">
        <div className="h-0.5 w-full bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 dark:from-slate-500 dark:to-slate-400" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">Prescription History</h2>
          </div>
          <button className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all">
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/40">
          {(["recent", "backlog"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`
                flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all
                ${activeTab === tab
                  ? "border-b-2 border-teal-500 text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-900"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"}
              `}>
              {tab === "recent" ? "Current / Active" : "Backlog"}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[600px]">
          {isHistoryLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
              <p className="text-xs text-slate-400 dark:text-slate-500">Loading records…</p>
            </div>
          ) : prescriptionHistory?.length ? (
            prescriptionHistory.map((pres, idx) => (
              <div key={pres.UnkId || idx} className="
                rounded-xl border border-slate-200 dark:border-slate-700/60
                bg-white dark:bg-slate-800/60
                hover:border-teal-200 dark:hover:border-teal-700/40
                hover:-translate-y-0.5 hover:shadow-sm
                transition-all duration-150 overflow-hidden
              ">
                {/* Left teal bar */}
                <div className="flex">
                  <div className="w-0.5 bg-gradient-to-b from-teal-400 to-cyan-400 self-stretch flex-shrink-0" />
                  <div className="p-3.5 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">{pres.DrugsCode}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30 flex-shrink-0">
                        {pres.PrescriptionType}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-[10px] text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{pres.Dose}{pres.Frequency ? ` · ${pres.Frequency}` : ""}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(pres.StartDate).toLocaleDateString()}</span>
                    </div>
                    {pres.Instruction && (
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700/60 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Instructions</p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300">{pres.Instruction}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <Pill className="w-6 h-6 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No prescriptions found</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Add a medication using the form</p>
            </div>
          )}
        </div>
      </div>

    </div>
  </>
  );
};

/* ── FieldLabel ── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{children}</label>;
}

/* ── ToggleBtn ── */
function ToggleBtn({ children, active, onClick, color = "teal", block = false }: {
  children: React.ReactNode; active: boolean; onClick: () => void; color?: "teal" | "blue"; block?: boolean;
}) {
  const activeClass = color === "blue"
    ? "bg-blue-600 border-blue-600 text-white"
    : "bg-teal-600 border-teal-600 text-white";
  return (
    <button
      onClick={onClick}
      className={`
        ${block ? "w-full text-left" : ""}
        px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all duration-150
        ${active
          ? activeClass
          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}
      `}
    >
      {children}
    </button>
  );
}

export default PrescriptionForm;