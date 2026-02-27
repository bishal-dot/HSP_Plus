"use client";

import { useAuthToken } from "@/context/AuthContext";
import { 
  Pill,
  Calendar,
  Clock,
  Plus,
  X,
  Printer,
  Save,
  Trash2,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { usePrescriptionHistory } from "../queries/prescription.queries";
import { Medication, PrescriptionFormRequest } from "@/types/prescription.type";
import { usePrescriptionMaster } from "@/queries/master.queries";

interface MasterItem {
  Code: number;
  label: string;
}

const PrescriptionForm: React.FC<PrescriptionFormRequest> = ({
  patientCode , patientName, regNo, age, gender, doctorName
}) => {
  const { authToken } = useAuthToken();
  
  // 1. STAGING STATE
  const [medications, setMedications] = useState<Medication[]>([]);
  const [activeTab, setActiveTab] = useState<'recent' | 'backlog'>('recent');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. FORM FIELD STATE
  const [drugName, setDrugName] = useState("");
  const [dose, setDose] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState("");
  const [timePeriod, setTimePeriod] = useState("Day(s)");
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([]);
  const [remarks, setRemarks] = useState("");

  // 3. QUERIES (Fetching from your database tables)
  const { data: prescriptionHistory, isLoading: isHistoryLoading, refetch } = usePrescriptionHistory(authToken, patientCode);
  const { data: masters, isLoading: isMasterLoading } = usePrescriptionMaster(authToken);

  // Extracting master data from the API response
  const masterRoutes = masters?.routes || [];
  const masterFrequencies = masters?.frequency || [];
  const masterInstructions = masters?.instructions || [];
  console.log("Master Data:", masters);

  const handleClearForm = () => {
    setDrugName("");
    setDose("");
    setSelectedFrequency("");
    setSelectedRoute("");
    setDuration("");
    setRemarks("");
    setSelectedInstructions([]);
  };

  const handleAddMedication = () => {
    if (!drugName || !dose) {
      alert("Please enter Drug Name and Dose");
      return;
    }

    const freqCode = masterFrequencies.find((f:MasterItem) => f.label === selectedFrequency)?.Code ?? null;
    const routeCode = masterRoutes.find((r:MasterItem) => r.label === selectedRoute)?.Code ?? null;

    const newMed: Medication = {
      id: Date.now().toString(),
      drugName,
      dose,
      frequency: selectedFrequency,
      route: selectedRoute,
      startDate,
      duration,
      timePeriod,
      instructions: selectedInstructions,
      remarks,
    };

    setMedications((prev) => [...prev, newMed]);
    handleClearForm();
  };

  const toggleInstruction = (instruction: string) => {
    setSelectedInstructions(prev => 
      prev.includes(instruction)
        ? prev.filter(i => i !== instruction)
        : [...prev, instruction]
    );
  };

  const handleSubmit = async () => {
    if (medications.length === 0) {
      alert("No medications to save.");
      return;
    }

    setIsSubmitting(true);
    try {
      await Promise.all(
        medications.map((med) =>
          fetch(`/api/patient/prescription/${patientCode}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              UnkId: 0,
              PatientCode: patientCode,
              RegNo: regNo,
              PrescriptionType: "Regular",
              DrugsCode: med.drugName,
              Dose: parseFloat(med.dose.trim()),
              Frequency: med.freqCode,
              Route: med.routeCode,
              StartDate: med.startDate,
              Duration: Number(med.duration),
              DurationOn: med.timePeriod,
              TotalQty: 0,
              Instruction: med.instructions.join(", "),
              AdditionalInstr: med.remarks,
              PatientName: patientName,
              Age: age,
              Gender: gender,
              DoctorName: doctorName,
            })
          })
        )
      );

      alert("Prescription saved successfully!");
      setMedications([]);
      refetch();
    } catch (error) {
      console.error(error);
      alert("Error saving prescription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* LEFT PANEL: FORM ENTRY */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-teal-600 px-6 py-4 flex items-center gap-3 text-white">
                <Pill className="w-5 h-5" />
                <h2 className="font-bold">New Medication</h2>
                {isMasterLoading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
              </div>

              <div className="p-6 space-y-5">
                {/* Drug Selection */}
               <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Drug Name *
                </label>
                <input
                  type="text"
                  value={drugName}
                  onChange={(e) => setDrugName(e.target.value)}
                  placeholder="e.g. Paracetamol 500mg"
                  className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>


                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Dose *</label>
                    <input 
                      type="text" 
                      value={dose} 
                      onChange={(e) => setDose(e.target.value)}
                      placeholder="e.g. 1 tab"
                      className="w-full p-3 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Frequency</label>
                    <div className="flex flex-wrap gap-1">
                      {masterFrequencies.map((f: any, index:number) => (
                        <button 
                          key={f.Code ?? index} 
                          onClick={() => setSelectedFrequency(f.label)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${selectedFrequency === (f.label) ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white text-slate-600'}`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Route</label>
                  <div className="grid grid-cols-2 gap-1">
                    {masterRoutes.map((r: any, index: number) => (
                      <button 
                        key={r.Code?? index} 
                        onClick={() => setSelectedRoute(r.label)}
                        className={`px-3 py-2 text-xs font-bold rounded-lg border text-left transition ${selectedRoute === (r.label) ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Duration</label>
                    <div className="flex gap-2">
                      <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Qty" className="w-20 p-3 bg-slate-50 border rounded-xl text-sm" />
                      <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} className="flex-1 p-3 bg-slate-50 border rounded-xl text-sm">
                        <option>Day(s)</option>
                        <option>Week(s)</option>
                        <option>Month(s)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Instructions</label>
                  <div className="grid grid-cols-2 gap-2">
                    {masterInstructions.map((inst: any, index: number) => (
                      <button 
                        key={inst.Code ?? index} 
                        onClick={() => toggleInstruction(inst.label)}
                        className={`px-3 py-2 text-xs rounded-lg border text-left transition ${selectedInstructions.includes(inst.label) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white text-slate-600'}`}
                      >
                        {inst.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleAddMedication}
                  className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal-700 transition shadow-lg"
                >
                  <Plus className="w-5 h-5" /> Add to List
                </button>
              </div>
            </div>

            {/* STAGING AREA */}
            {medications.length > 0 && (
              <div className="bg-white rounded-2xl border-2 border-dashed border-teal-200 p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Pending Selection ({medications.length})</h3>
                  <button onClick={() => setMedications([])} className="text-xs text-red-500 font-bold">Discard All</button>
                </div>
                <div className="space-y-2">
                  {medications.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-teal-50 rounded-xl border border-teal-100">
                      <div>
                        <p className="font-bold text-teal-900 text-sm">{m.drugName}</p>
                        <p className="text-xs text-teal-700">{m.dose} | {m.frequency} | {m.duration} {m.timePeriod}</p>
                      </div>
                      <button onClick={() => setMedications(medications.filter(x => x.id !== m.id))} className="text-red-400 hover:text-red-600 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" /> {isSubmitting ? 'Saving...' : 'Finalize & Save All'}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: HISTORY */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-fit max-h-225">
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between text-white">
              <h2 className="font-bold tracking-tight">Prescription History</h2>
              <Printer className="w-4 h-4 cursor-pointer hover:text-teal-400" />
            </div>

            <div className="flex border-b bg-slate-50">
              <button 
                onClick={() => setActiveTab('recent')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'recent' ? 'border-b-2 border-teal-500 text-teal-600 bg-white' : 'text-slate-400'}`}
              >
                Current / Active
              </button>
              <button 
                onClick={() => setActiveTab('backlog')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'backlog' ? 'border-b-2 border-teal-500 text-teal-600 bg-white' : 'text-slate-400'}`}
              >
                Backlog
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isHistoryLoading ? (
                <div className="flex flex-col items-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                    <p className="text-slate-400 text-sm">Loading records...</p>
                </div>
              ) : prescriptionHistory?.length ? (
                prescriptionHistory.map((pres, idx) => (
                  <div key={pres.UnkId || idx} className="p-4 border rounded-xl bg-white shadow-sm hover:border-teal-200 transition">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800">{pres.DrugsCode}</h4>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold">{pres.PrescriptionType}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-slate-400" /> {pres.Dose} ({pres.Frequency || 'N/A'})</div>
                      <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(pres.StartDate).toLocaleDateString()}</div>
                      <div className="col-span-2 bg-slate-50 p-3 rounded-lg mt-1 border border-slate-100 text-slate-600">
                        <span className="font-bold text-[10px] uppercase text-slate-400 block mb-1">Instructions</span>
                        {pres.Instruction || "None provided"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Pill className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-sm">No prescriptions found for this patient.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrescriptionForm;