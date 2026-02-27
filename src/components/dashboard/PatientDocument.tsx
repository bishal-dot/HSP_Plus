"use client";

import React, { useState, useMemo } from "react";
import {
  User,
  Camera,
  Save,
  Search,
  ChevronDown,
  ChevronUp,
  Activity,
  X,
  Plus,
  Check,
} from "lucide-react";

/* =======================
   Types
======================= */

type VisitType = "OPD" | "IPD" | "Emergency" | "FollowUp" | "";

interface Patient {
  id: string;
  name: string;
  gender: "Male" | "Female";
  age: number;
  bloodType: string;
}

/* =======================
   Mock Data
======================= */

const patients: Patient[] = [
  { id: "ABC00001", name: "John Doe", gender: "Male", age: 23, bloodType: "O+" },
  { id: "ABC00002", name: "Jane Smith", gender: "Female", age: 31, bloodType: "A-" },
  { id: "ABC00003", name: "Mark Brown", gender: "Male", age: 45, bloodType: "B+" },
  { id: "ABC00004", name: "Sara Lee", gender: "Female", age: 27, bloodType: "AB+" },
];

const avatarGradients = [
  "from-sky-400 to-blue-600",
  "from-violet-400 to-purple-600",
  "from-emerald-400 to-teal-600",
  "from-rose-400 to-pink-600",
];

/* =======================
   Component
======================= */

export default function PatientDocument(){
  const [activeTab, setActiveTab] = useState<"active" | "all">("active");
  const [search, setSearch] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [visitOpen, setVisitOpen] = useState<boolean>(true);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);

  const [visitType, setVisitType] = useState<VisitType>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );

  const [saved, setSaved] = useState<boolean>(false);

  const filteredPatients = useMemo(() => {
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleSave = (): void => {
    if (!visitType || !startDate) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Patient Documents
            </h1>
          </div>
          {/* <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
            <Activity className="w-4 h-4 text-teal-500" />
            <span className="text-sm font-semibold text-slate-600">
              {patients.length} Patients
            </span>
          </div> */}
        </div>

        {/* Patient List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">

          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or patientcode..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {filteredPatients.map((patient, i) => (
              <button
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition ${
                  selectedPatient?.id === patient.id
                    ? "border-teal-400 bg-teal-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                    avatarGradients[i % avatarGradients.length]
                  } flex items-center justify-center`}
                >
                  <User className="w-5 h-5 text-white" />
                </div>

                <p className="text-sm font-semibold">{patient.name}</p>
                <p className="text-xs text-slate-400">{patient.id}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Visit Section */}
        {selectedPatient && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

            {/* Patient Banner */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-5 flex justify-between items-center">
              <div>
                <h2 className="text-white font-bold text-lg">
                  {selectedPatient.name}
                </h2>
                <p className="text-white/80 text-sm">
                  {selectedPatient.id} • {selectedPatient.gender} •{" "}
                  {selectedPatient.age} yrs • {selectedPatient.bloodType}
                </p>
              </div>

              <button onClick={() => setSelectedPatient(null)}>
                <X className="text-white w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">

              {/* New Visit */}
              <div className="border rounded-xl overflow-hidden">
                <button
                  onClick={() => setVisitOpen(!visitOpen)}
                  className="w-full flex justify-between px-5 py-4 bg-slate-50"
                >
                  <span className="font-semibold">New Visit</span>
                  {visitOpen ? <ChevronUp /> : <ChevronDown />}
                </button>

                {visitOpen && (
                  <div className="p-5 space-y-4 border-t">

                    <div className="grid sm:grid-cols-3 gap-4">
                      <select
                        value={visitType}
                        onChange={(e) =>
                          setVisitType(e.target.value as VisitType)
                        }
                        className="border rounded-xl px-3 py-2"
                      >
                        <option value="">Select Visit Type</option>
                        <option value="OPD">OPD</option>
                        <option value="IPD">IPD</option>
                        <option value="Emergency">Emergency</option>
                        <option value="FollowUp">Follow Up</option>
                      </select>

                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border rounded-xl px-3 py-2"
                      />

                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border rounded-xl px-3 py-2"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button className="bg-teal-600 text-white px-4 py-2 rounded-xl flex items-center gap-2">
                        <Camera size={16} />
                        Scan
                      </button>

                      <button
                        onClick={handleSave}
                        className={`px-4 py-2 rounded-xl text-white flex items-center gap-2 ${
                          saved ? "bg-emerald-500" : "bg-slate-500"
                        }`}
                      >
                        {saved ? <Check size={16} /> : <Save size={16} />}
                        {saved ? "Saved" : "Save"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Visit History */}
              <div className="border rounded-xl overflow-hidden">
                <button
                  onClick={() => setHistoryOpen(!historyOpen)}
                  className="w-full flex justify-between px-5 py-4 bg-slate-50"
                >
                  <span className="font-semibold">Visit History</span>
                  {historyOpen ? <ChevronUp /> : <ChevronDown />}
                </button>

                {historyOpen && (
                  <div className="p-6 text-center text-slate-400 border-t">
                    No visit history yet
                    <div className="mt-4">
                      <button className="border-dashed border-2 px-4 py-2 rounded-xl flex items-center gap-2 mx-auto">
                        <Plus size={16} />
                        Add Visit Record
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
