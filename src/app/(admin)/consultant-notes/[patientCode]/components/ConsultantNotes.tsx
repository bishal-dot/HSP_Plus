"use client";

import { useAuthToken } from "@/context/AuthContext";
import {
  Stethoscope,
  HeartPulse,
  ClipboardPlus,
  Thermometer,
  BrainCircuit,
  ChevronRight,
  X,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

interface FormProps {
  existingNotes: any;
  router?: any;
}

const ConsultantNotesForm: React.FC<FormProps> = ({ existingNotes, router }) => {

  const { consultantCode } = useAuthToken();
  const [patientInfo, setPatientInfo] = useState<any>(null);
  useEffect(() => {
      const stored = sessionStorage.getItem("selectedPatient");
      if (stored) setPatientInfo(JSON.parse(stored));
    }, []);

  const patientId   = patientInfo?.MRNo || patientInfo?.PatientCode || patientInfo?.Mrno;
  const patientNo   = patientInfo?.TokenNo || patientInfo?.IPDCODE;
  const regCode     = patientInfo?.RegNo || patientInfo?.RegCode;

  const [formData, setFormData] = useState<any>({
    chiefComplaint: existingNotes?.history?.chiefComplaint || "",
    hopi: existingNotes?.history?.hopi || "",
    pastHistory: existingNotes?.history?.pastHistory || "",
    personalHistory: existingNotes?.history?.personalHistory || "",
    medicalHistory: existingNotes?.history?.medicalHistory || "",
    allergies: existingNotes?.history?.allergies || "",
    generalCondition: existingNotes?.examination?.generalCondition || "",
    pr: existingNotes?.examination?.vitals?.pr || "",
    rr: existingNotes?.examination?.vitals?.rr || "",
    bp: existingNotes?.examination?.vitals?.bp || "",
    spo2: existingNotes?.examination?.vitals?.spo2 || "",
    temperature: existingNotes?.examination?.vitals?.temperature || "",
    crt: existingNotes?.examination?.vitals?.crt || "",
    rs: existingNotes?.examination?.rs || "",
    cvs: existingNotes?.examination?.cvs || "",
    pa: existingNotes?.examination?.pa || "",
    cns: existingNotes?.examination?.cns || "",
    others: existingNotes?.examination?.others || "",
    diagnosis: existingNotes?.assessment?.diagnosis || "",
    icdCode: existingNotes?.assessment?.icdCode || "",
    advice: existingNotes?.assessment?.advicePlan || "",
  });
  const handleChange = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      // const patientInfo = JSON.parse(sessionStorage.getItem("selectedPatient") || "{}");
  
      const response = await fetch("/api/patient/consultant-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientCode: patientId,
          regCode: regCode,
          consultantCode: consultantCode,
          deptCode: 1,
          userId: patientInfo?.Tokenid,
          formData,
        }),
      });
      const result = await response.json();
      if (result.success) toast.success("Notes saved successfully!");
      else alert("Failed to save notes");
    } catch (e) {
      alert("Something went wrong");
    }
  };

  return (
    <div className="space-y-6 font-[family-name:var(--font-geist-sans)]">

      <ToastContainer position="top-right"/>

      {/* ── History ── */}
      <Card
        icon={<Stethoscope className="w-4 h-4" />}
        title="History"
        accent="blue"
      >
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: "Chief Complaint", key: "chiefComplaint" },
            { label: "History of Present Illness", key: "hopi" },
            { label: "Past History", key: "pastHistory" },
            { label: "Personal History", key: "personalHistory" },
            { label: "Medical History", key: "medicalHistory" },
            { label: "Allergies", key: "allergies" },
          ].map((f) => (
            <FieldBlock key={f.key} label={f.label}>
              <textarea
                rows={2}
                value={formData[f.key]}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className={textAreaClass}
                placeholder={`Enter ${f.label.toLowerCase()}…`}
              />
            </FieldBlock>
          ))}
        </div>
      </Card>

      {/* ── Examination ── */}
      <Card
        icon={<HeartPulse className="w-4 h-4" />}
        title="Examination"
        accent="emerald"
      >
        {/* General Condition */}
        <FieldBlock label="General Condition">
          <input
            type="text"
            value={formData.generalCondition}
            onChange={(e) => handleChange("generalCondition", e.target.value)}
            className={inputClass}
            placeholder="e.g. Conscious, oriented, afebrile…"
          />
        </FieldBlock>

        {/* Vitals strip */}
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-3">
            <Thermometer className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Vitals
            </span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { key: "pr",          label: "PR",    unit: "bpm"  },
              { key: "rr",          label: "RR",    unit: "/min" },
              { key: "bp",          label: "BP",    unit: "mmHg" },
              { key: "spo2",        label: "SpO₂",  unit: "%"    },
              { key: "temperature", label: "Temp",  unit: "°F"   },
              { key: "crt",         label: "CRT",   unit: "sec"  },
            ].map((v) => (
              <div
                key={v.key}
                className="
                  flex flex-col items-center gap-1.5 p-3
                  rounded-xl border border-gray-100 dark:border-gray-700
                  bg-gray-50 dark:bg-gray-800/60
                  hover:border-emerald-300 dark:hover:border-emerald-600
                  transition-colors group
                "
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 transition-colors">
                  {v.label}
                </span>
                <input
                  type="text"
                  value={formData[v.key]}
                  onChange={(e) => handleChange(v.key, e.target.value)}
                  className="
                    w-full text-center text-sm font-semibold
                    bg-transparent border-none outline-none
                    text-gray-800 dark:text-gray-100
                    placeholder:text-gray-300 dark:placeholder:text-gray-600
                  "
                  placeholder="—"
                />
                <span className="text-[9px] text-gray-300 dark:text-gray-600">
                  {v.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System exams */}
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-3">
            <BrainCircuit className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Systemic Examination
            </span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { key: "rs",     label: "RS — Respiratory System"    },
              { key: "cvs",    label: "CVS — Cardiovascular System" },
              { key: "pa",     label: "PA — Per Abdomen"            },
              { key: "cns",    label: "CNS — Central Nervous System"},
              { key: "others", label: "Others"                      },
            ].map((exam) => (
              <FieldBlock key={exam.key} label={exam.label}>
                <textarea
                  rows={2}
                  value={formData[exam.key]}
                  onChange={(e) => handleChange(exam.key, e.target.value)}
                  className={textAreaClass}
                  placeholder="Findings…"
                />
              </FieldBlock>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Assessment & Plan ── */}
      <Card
        icon={<ClipboardPlus className="w-4 h-4" />}
        title="Assessment & Plan"
        accent="violet"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <FieldBlock label="Diagnosis">
            <input
              type="text"
              value={formData.diagnosis}
              onChange={(e) => handleChange("diagnosis", e.target.value)}
              className={inputClass}
              placeholder="Primary diagnosis…"
            />
          </FieldBlock>

          <FieldBlock label="ICD Code">
            <input
              type="text"
              value={formData.icdCode}
              onChange={(e) => handleChange("icdCode", e.target.value)}
              className={inputClass}
              placeholder="e.g. J18.9"
            />
          </FieldBlock>
        </div>

        <FieldBlock label="Advice / Plan">
          <textarea
            rows={3}
            value={formData.advice}
            onChange={(e) => handleChange("advice", e.target.value)}
            className={textAreaClass}
            placeholder="Treatment plan, investigations ordered, follow-up instructions…"
          />
        </FieldBlock>
      </Card>

      {/* ── Action bar ── */}
      <div className="
        flex items-center justify-between
        rounded-xl px-5 py-3.5
        bg-gray-50 dark:bg-gray-800/60
        border border-gray-100 dark:border-gray-700
      ">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          All fields are saved to the patient's EMR
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router?.push("/dashboard/")}
            className="
              inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
              border border-gray-200 dark:border-gray-600
              text-gray-600 dark:text-gray-300
              hover:bg-red-50 hover:border-red-300 hover:text-red-600
              dark:hover:bg-red-900/20 dark:hover:border-red-700 dark:hover:text-red-400
              transition-all duration-150
            "
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="
              inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold
              bg-blue-600 hover:bg-blue-700
              dark:bg-blue-500 dark:hover:bg-blue-600
              text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/40
              transition-all duration-150 active:scale-[0.98]
            "
          >
            <Save className="w-3.5 h-3.5" />
            {existingNotes ? "Update Notes" : "Save Notes"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Shared input styles ── */
const baseInput = `
  w-full rounded-md text-xs
  bg-white dark:bg-gray-800
  border border-gray-200 dark:border-gray-700
  text-gray-800 dark:text-gray-100
  placeholder:text-gray-300 dark:placeholder:text-gray-600
  focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
  dark:focus:border-blue-500
  transition-colors duration-150
`;
const inputClass    = `${baseInput} px-2.5 py-1.5`;
const textAreaClass = `${baseInput} px-2.5 py-1.5 resize-none leading-relaxed`;

/* ── Card ── */
const accentMap: Record<string, string> = {
  blue:    "text-blue-600   dark:text-blue-400   bg-blue-50   dark:bg-blue-900/20   border-blue-100  dark:border-blue-800/40",
  emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/40",
  violet:  "text-violet-600  dark:text-violet-400  bg-violet-50  dark:bg-violet-900/20  border-violet-100 dark:border-violet-800/40",
};

function Card({
  title,
  icon,
  accent = "blue",
  children,
}: {
  title: string;
  icon: React.ReactNode;
  accent?: string;
  children: React.ReactNode;
}) {
  const colors = accentMap[accent];
  return (
    <div className="
      rounded-2xl border border-gray-200 dark:border-gray-700
      bg-white dark:bg-gray-900
      shadow-sm shadow-gray-100 dark:shadow-none
      overflow-hidden
    ">
      {/* Header */}
      <div className={`flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/80`}>
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border ${colors}`}>
          {icon}
        </span>
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
          {title}
        </h2>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 ml-auto" />
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

/* ── Field ── */
function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {label}
      </label>
      {children}
    </div>
  );
}

export default ConsultantNotesForm;