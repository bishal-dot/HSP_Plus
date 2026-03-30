"use client";

import DrawableCanvas, { Drawing } from "@/components/ui/drawable/DrawableCanvas";
import { useAuthToken } from "@/context/AuthContext";
import {
  Stethoscope, ClipboardList, FileText, Ear, Save,
  Printer, Activity, Eye, Check, X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────
type DiagnosisKey =
  | "normal" | "wax" | "oe" | "myringitis" | "etDysfunction"
  | "glue" | "aom" | "chl" | "snhl" | "csomMucosal"
  | "csomSquamous" | "unclassified";

type EarSide = "R" | "L" | "Bilat" | "";
type ExamFieldKey = "rightEar" | "leftEar" | "rightNose" | "leftNose";

interface Procedures       { syringingR: boolean; microscopeExam: boolean; nasoendoscopy: boolean }
interface AudiologyTests   { ptAudio: boolean; tympanometry: boolean; stapedialReflexes: boolean; speechAudio: boolean; oae: boolean; abr: boolean; vestibularTest: boolean }
interface AudiologyTreatment { hearingAid: boolean; hearingAidReview: boolean; hearingTinnitusRehab: boolean; speechLanguage: boolean; assessmentRehab: boolean }
interface Diagnosis {
  normal: EarSide; wax: EarSide; oe: EarSide; myringitis: EarSide; etDysfunction: EarSide;
  glue: EarSide; aom: EarSide; chl: EarSide; snhl: EarSide; csomMucosal: EarSide;
  csomSquamous: EarSide; unclassified: EarSide;
  vertigoBalance: boolean; tinnitus: boolean; other: string;
}
interface ExamField { strokes: Drawing; value: string }
interface FormProps  { existingNotes?: any; router?: any }

const diagnosisList: { key: DiagnosisKey; label: string }[] = [
  { key: "normal",        label: "Normal" },
  { key: "wax",           label: "Wax" },
  { key: "oe",            label: "O.E (Dry/Wet)" },
  { key: "myringitis",    label: "Myringitis" },
  { key: "etDysfunction", label: "ET Dysfunction" },
  { key: "glue",          label: "Glue" },
  { key: "aom",           label: "AOM (Active/Recurrent)" },
  { key: "chl",           label: "CHL with intact TM" },
  { key: "snhl",          label: "SNHL" },
  { key: "csomMucosal",   label: "CSOM Mucosal" },
  { key: "csomSquamous",  label: "CSOM Squamous" },
  { key: "unclassified",  label: "Unclassified" },
];

/* ── shared styles ── */
const inputClass = `
  w-full px-2.5 py-1.5 rounded-lg text-xs
  border border-slate-200 dark:border-slate-700
  bg-white dark:bg-slate-800
  text-slate-800 dark:text-slate-200
  placeholder:text-slate-300 dark:placeholder:text-slate-600
  focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500
  transition-all duration-150
`;

const textareaClass = `${inputClass} resize-none leading-relaxed`;

const ENTConsultantNotesForm: React.FC<FormProps> = ({ existingNotes, router }) => {
  const { consultantCode } = useAuthToken();
    const [patientInfo, setPatientInfo] = useState<any>(null);
    useEffect(() => {
        const stored = sessionStorage.getItem("selectedPatient");
        if (stored) setPatientInfo(JSON.parse(stored));
      }, []);
  const patientId   = patientInfo?.MRNo || patientInfo?.PatientCode || patientInfo?.Mrno;
  const patientNo   = patientInfo?.TokenNo || patientInfo?.IPDCODE;
  const regCode     = patientInfo?.RegNo || patientInfo?.RegCode;
  
  const [presentComplaint,    setPresentComplaint]    = useState("");
  const [pastMedicalHistory,  setPastMedicalHistory]  = useState("");
  const [notes,               setNotes]               = useState("");
  const [treatmentPlan,       setTreatmentPlan]       = useState("");

  const [examination, setExamination] = useState<{
    rightEar: ExamField; leftEar: ExamField; rightNose: ExamField; leftNose: ExamField;
  }>({
    rightEar:  { strokes: [], value: "" },
    leftEar:   { strokes: [], value: "" },
    rightNose: { strokes: [], value: "" },
    leftNose:  { strokes: [], value: "" },
  });

  const [procedures, setProcedures] = useState<Procedures>({
    syringingR: false, microscopeExam: false, nasoendoscopy: false,
  });
  const [audiologyTests, setAudiologyTests] = useState<AudiologyTests>({
    ptAudio: false, tympanometry: false, stapedialReflexes: false,
    speechAudio: false, oae: false, abr: false, vestibularTest: false,
  });
  const [audiologyTreatment, setAudiologyTreatment] = useState<AudiologyTreatment>({
    hearingAid: false, hearingAidReview: false, hearingTinnitusRehab: false,
    speechLanguage: false, assessmentRehab: false,
  });
  const [diagnosis, setDiagnosis] = useState<Diagnosis>({
    normal: "", wax: "", oe: "", myringitis: "", etDysfunction: "",
    glue: "", aom: "", chl: "", snhl: "", csomMucosal: "",
    csomSquamous: "", unclassified: "",
    vertigoBalance: false, tinnitus: false, other: "",
  });

  const selectSide = (key: DiagnosisKey, side: EarSide) =>
    setDiagnosis(prev => ({ ...prev, [key]: prev[key] === side ? "" : side }));

  const buildPayload = () => {
    const rows: { TypeId: number; InvestigationId: number; Value: string }[] = [];
    rows.push({ TypeId: 1, InvestigationId: 1, Value: procedures.syringingR     ? "1" : "0" });
    rows.push({ TypeId: 1, InvestigationId: 2, Value: procedures.microscopeExam ? "1" : "0" });
    rows.push({ TypeId: 1, InvestigationId: 3, Value: procedures.nasoendoscopy  ? "1" : "0" });
    rows.push({ TypeId: 2, InvestigationId: 4,  Value: audiologyTests.ptAudio          ? "1" : "0" });
    rows.push({ TypeId: 2, InvestigationId: 5,  Value: audiologyTests.tympanometry      ? "1" : "0" });
    rows.push({ TypeId: 2, InvestigationId: 6,  Value: audiologyTests.stapedialReflexes ? "1" : "0" });
    rows.push({ TypeId: 2, InvestigationId: 7,  Value: audiologyTests.speechAudio       ? "1" : "0" });
    rows.push({ TypeId: 2, InvestigationId: 8,  Value: audiologyTests.oae               ? "1" : "0" });
    rows.push({ TypeId: 2, InvestigationId: 9,  Value: audiologyTests.abr               ? "1" : "0" });
    rows.push({ TypeId: 2, InvestigationId: 10, Value: audiologyTests.vestibularTest     ? "1" : "0" });
    rows.push({ TypeId: 3, InvestigationId: 1, Value: audiologyTreatment.hearingAid          ? "1" : "0" });
    rows.push({ TypeId: 3, InvestigationId: 2, Value: audiologyTreatment.hearingAidReview     ? "1" : "0" });
    rows.push({ TypeId: 3, InvestigationId: 3, Value: audiologyTreatment.hearingTinnitusRehab ? "1" : "0" });
    rows.push({ TypeId: 3, InvestigationId: 4, Value: audiologyTreatment.speechLanguage       ? "1" : "0" });
    rows.push({ TypeId: 3, InvestigationId: 5, Value: audiologyTreatment.assessmentRehab      ? "1" : "0" });
    diagnosisList.forEach((item, i) => {
      const v = diagnosis[item.key];
      if (v) rows.push({ TypeId: 4, InvestigationId: i + 1, Value: v });
    });
    if (diagnosis.vertigoBalance) rows.push({ TypeId: 5, InvestigationId: 1, Value: "1" });
    if (diagnosis.tinnitus)       rows.push({ TypeId: 6, InvestigationId: 1, Value: "1" });
    rows.push({ TypeId: 7, InvestigationId: 1, Value: JSON.stringify(examination.rightEar)  });
    rows.push({ TypeId: 7, InvestigationId: 2, Value: JSON.stringify(examination.leftEar)   });
    rows.push({ TypeId: 7, InvestigationId: 3, Value: JSON.stringify(examination.rightNose) });
    rows.push({ TypeId: 7, InvestigationId: 4, Value: JSON.stringify(examination.leftNose)  });
    return rows;
  };

  const saveNotes = async () => {
    const patientInfo = JSON.parse(sessionStorage.getItem("selectedPatient") || "{}");
    const res  = await fetch("/api/patient/ent-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        patientInfo,
        presentComplaint: presentComplaint,
        previousHistory: pastMedicalHistory,
        treatmentPlan, 
        payload: buildPayload() }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message || 'Failed to save notes. Please try again.');
    return result;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: saveNotes,
    onSuccess: () => {
      toast.success("Notes saved successfully.");
    },
    onError: (err: any) => {
      toast.error("Failed to save notes. Please try again.");
    }
  });

  const handleSubmit =  (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Present Complaint & Past Medical History ── */}
        <SectionCard icon={<ClipboardList className="w-4 h-4" />} title="History" color="blue">
          <div className="grid md:grid-cols-2 gap-4">
            <FieldBlock label="Present Complaint">
              <textarea rows={5} value={presentComplaint} onChange={e => setPresentComplaint(e.target.value)}
                placeholder="Describe the present complaint…" className={textareaClass} />
            </FieldBlock>
            <FieldBlock label="Past Medical History">
              <textarea rows={5} value={pastMedicalHistory} onChange={e => setPastMedicalHistory(e.target.value)}
                placeholder="Past medical history…" className={textareaClass} />
            </FieldBlock>
          </div>
        </SectionCard>

        {/* ── Procedures + Investigations + Treatment ── */}
        <SectionCard icon={<Stethoscope className="w-4 h-4" />} title="Procedures & Audiology" color="emerald">
          <div className="grid md:grid-cols-3 gap-4">

            {/* Procedures */}
            <CheckGroup title="Procedure" icon={<Stethoscope className="w-3.5 h-3.5" />} color="emerald">
              {[
                { key: "syringingR",    label: "Syringing R/L" },
                { key: "microscopeExam",label: "Microscope Exam (MSE)" },
                { key: "nasoendoscopy", label: "Nasoendoscopy (NE)" },
              ].map(({ key, label }) => (
                <CheckItem key={key} id={key} label={label}
                  checked={(procedures as any)[key]}
                  onChange={v => setProcedures({ ...procedures, [key]: v })} />
              ))}
            </CheckGroup>

            {/* Audiology Investigations */}
            <CheckGroup title="Audiology Investigations" icon={<Activity className="w-3.5 h-3.5" />} color="blue">
              {[
                { key: "ptAudio",           label: "PT Audio" },
                { key: "tympanometry",      label: "Tympanometry" },
                { key: "stapedialReflexes", label: "Stapedial Reflexes" },
                { key: "speechAudio",       label: "Speech Audio" },
                { key: "oae",               label: "OAE" },
                { key: "abr",               label: "ABR" },
                { key: "vestibularTest",    label: "Vestibular Function Tests" },
              ].map(({ key, label }) => (
                <CheckItem key={key} id={key} label={label}
                  checked={(audiologyTests as any)[key]}
                  onChange={v => setAudiologyTests({ ...audiologyTests, [key]: v })} />
              ))}
            </CheckGroup>

            {/* Audiology Treatment */}
            <CheckGroup title="Audiology Treatment" icon={<Stethoscope className="w-3.5 h-3.5" />} color="violet">
              {[
                { key: "hearingAid",          label: "Hearing Aid" },
                { key: "hearingAidReview",    label: "Hearing Aid Review / Repair" },
                { key: "hearingTinnitusRehab",label: "Hearing / Tinnitus Rehab." },
                { key: "speechLanguage",      label: "Speech and Language" },
                { key: "assessmentRehab",     label: "Assessment / Rehab." },
              ].map(({ key, label }) => (
                <CheckItem key={key} id={key} label={label}
                  checked={(audiologyTreatment as any)[key]}
                  onChange={v => setAudiologyTreatment({ ...audiologyTreatment, [key]: v })} />
              ))}
            </CheckGroup>
          </div>
        </SectionCard>

        {/* ── Examination + Main Diagnosis ── */}
        <SectionCard icon={<Eye className="w-4 h-4" />} title="Examination & Diagnosis" color="rose">
          <div className="grid md:grid-cols-2 gap-6">

            {/* Ear / Nose diagrams */}
            <div className="space-y-5">
              {/* Ear */}
              <div>
                <SectionLabel icon={<Ear className="w-3.5 h-3.5" />} label="Ear Examination" color="rose" />
                <div className="flex justify-around items-start mt-3">
                  {([
                    { side: "R", field: "rightEar"  as ExamFieldKey, placeholder: "VII" },
                    { side: "L", field: "leftEar"   as ExamFieldKey, placeholder: "512" },
                  ] as const).map(({ side, field, placeholder }) => (
                    <DrawCircle key={side} side={side} field={field} placeholder={placeholder}
                      examination={examination} setExamination={setExamination} />
                  ))}
                </div>
              </div>

              {/* Nose */}
              {/* <div>
                <SectionLabel icon={<Eye className="w-3.5 h-3.5" />} label="Nose Examination" color="rose" />
                <div className="flex justify-around items-start mt-3">
                  {([
                    { side: "R", field: "rightNose" as ExamFieldKey, placeholder: "Nose R" },
                    { side: "L", field: "leftNose"  as ExamFieldKey, placeholder: "Nose L" },
                  ] as const).map(({ side, field, placeholder }) => (
                    <DrawCircle key={side} side={side} field={field} placeholder={placeholder}
                      examination={examination} setExamination={setExamination} />
                  ))}
                </div>
              </div> */}
            </div>

            {/* Main Diagnosis */}
            <div>
              <SectionLabel icon={<ClipboardList className="w-3.5 h-3.5" />} label="Main Diagnosis (R / L / Bilat)" color="rose" />
              <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">

                {/* Header */}
                <div className="grid grid-cols-[1fr_32px_32px_48px] items-center px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Diagnosis</span>
                  {["R", "L", "Bilat"].map(s => (
                    <span key={s} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-center">{s}</span>
                  ))}
                </div>

                {/* Rows */}
                <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
                  {diagnosisList.map(item => (
                    <div key={item.key} className="grid grid-cols-[1fr_32px_32px_48px] items-center px-3 py-2 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <span className={`text-xs ${diagnosis[item.key] ? "font-bold text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"}`}>
                        {item.label}
                      </span>
                      {(["R", "L", "Bilat"] as EarSide[]).map(side => (
                        <div key={side} className="flex justify-center">
                          <button type="button" onClick={() => selectSide(item.key, side)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150
                              ${diagnosis[item.key] === side
                                ? "bg-blue-600 border-blue-600 shadow-sm shadow-blue-200 dark:shadow-blue-900/40"
                                : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500"}`}>
                            {diagnosis[item.key] === side && <Check className="w-2.5 h-2.5 text-white" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Vertigo / Tinnitus */}
                <div className="flex gap-4 px-3 py-2.5 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/40">
                  {[
                    { key: "vertigoBalance", label: "Vertigo / Balance" },
                    { key: "tinnitus",       label: "Tinnitus" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <CheckboxUI
                        checked={(diagnosis as any)[key]}
                        onChange={v => setDiagnosis({ ...diagnosis, [key]: v })}
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{label}</span>
                    </label>
                  ))}
                </div>

                {/* Other */}
                <div className="px-3 py-2.5 border-t border-slate-100 dark:border-slate-700/60">
                  <input type="text" placeholder="Other diagnosis…" value={diagnosis.other}
                    onChange={e => setDiagnosis({ ...diagnosis, other: e.target.value })}
                    className={inputClass} />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Treatment Plan & Notes ── */}
        <SectionCard icon={<FileText className="w-4 h-4" />} title="Treatment Plan & Notes" color="violet">
          <div className="grid md:grid-cols-2 gap-4">
            <FieldBlock label="Treatment Plan">
              <textarea rows={8} value={treatmentPlan} onChange={e => setTreatmentPlan(e.target.value)}
                placeholder="Treatment plan…" className={textareaClass} />
            </FieldBlock>
            <FieldBlock label="Notes">
              <textarea rows={8} value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Additional notes…" className={textareaClass} />
            </FieldBlock>
          </div>
        </SectionCard>

        {/* ── Action bar ── */}
        <div className="
          flex items-center justify-between
          rounded-xl px-5 py-3.5
          bg-slate-50 dark:bg-slate-800/60
          border border-slate-100 dark:border-slate-700
        ">
          <p className="text-xs text-slate-400 dark:text-slate-500">All fields are saved to the patient's ENT record</p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => window.print()}
              className="
                inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium
                border border-slate-200 dark:border-slate-600
                text-slate-600 dark:text-slate-300
                hover:bg-slate-100 dark:hover:bg-slate-700
                transition-all duration-150
              ">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button type="submit"
              disabled={isPending}
              className="
                inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold
                bg-blue-600 hover:bg-blue-700
                dark:bg-blue-600 dark:hover:bg-blue-700
                text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/40
                transition-all duration-150 active:scale-[0.98]
              ">
              <Save className="w-3.5 h-3.5" />
              {isPending ? "Saving..." : "Save Notes"}
            </button>
          </div>
        </div>

      </form>
    </>
  );
};

export default ENTConsultantNotesForm;

/* ── Section card ── */
const accentMap: Record<string, { label: string; icon: string; stripe: string }> = {
  blue:    { label: "text-blue-600 dark:text-blue-400",     icon: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30",       stripe: "from-blue-500 to-cyan-400"     },
  emerald: { label: "text-emerald-600 dark:text-emerald-400", icon: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30", stripe: "from-emerald-500 to-teal-400" },
  rose:    { label: "text-rose-600 dark:text-rose-400",     icon: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/30",       stripe: "from-rose-500 to-pink-400"     },
  violet:  { label: "text-violet-600 dark:text-violet-400", icon: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800/30", stripe: "from-violet-500 to-purple-400" },
};

function SectionCard({ icon, title, color = "blue", children }: { icon: React.ReactNode; title: string; color?: string; children: React.ReactNode }) {
  const c = accentMap[color] ?? accentMap.blue;
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none overflow-hidden">
      <div className={`h-0.5 w-full bg-gradient-to-r ${c.stripe}`} />
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60">
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border ${c.icon}`}>{icon}</span>
        <h2 className={`text-xs font-bold uppercase tracking-widest ${c.label}`}>{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function SectionLabel({ icon, label, color = "blue" }: { icon: React.ReactNode; label: string; color?: string }) {
  const c = accentMap[color] ?? accentMap.blue;
  return (
    <div className="flex items-center gap-1.5">
      <span className={c.label}>{icon}</span>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${c.label}`}>{label}</span>
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700/60" />
    </div>
  );
}

function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</label>
      {children}
    </div>
  );
}

/* ── CheckGroup ── */
const groupColorMap: Record<string, { header: string; border: string }> = {
  emerald: { header: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-100 dark:border-emerald-800/30" },
  blue:    { header: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",             border: "border-blue-100 dark:border-blue-800/30"       },
  violet:  { header: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20",     border: "border-violet-100 dark:border-violet-800/30"   },
};

function CheckGroup({ title, icon, color = "blue", children }: { title: string; icon: React.ReactNode; color?: string; children: React.ReactNode }) {
  const c = groupColorMap[color] ?? groupColorMap.blue;
  return (
    <div className={`rounded-xl border ${c.border} overflow-hidden`}>
      <div className={`flex items-center gap-2 px-3 py-2.5 border-b ${c.border} ${c.header}`}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{title}</span>
      </div>
      <div className="p-3 space-y-2.5 bg-white dark:bg-slate-800/40">{children}</div>
    </div>
  );
}

function CheckItem({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2.5 cursor-pointer group">
      <CheckboxUI checked={checked} onChange={onChange} id={id} />
      <span className={`text-xs transition-colors ${checked ? "text-blue-700 dark:text-blue-400 font-semibold" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"}`}>
        {label}
      </span>
    </label>
  );
}

function CheckboxUI({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id?: string }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} id={id}
      onClick={() => onChange(!checked)}
      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150 flex-shrink-0
        ${checked
          ? "bg-blue-600 border-blue-600 shadow-sm shadow-blue-200 dark:shadow-blue-900/40"
          : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500"}`}>
      {checked && <Check className="w-2.5 h-2.5 text-white" />}
    </button>
  );
}

/* ── DrawCircle ── */
function DrawCircle({ side, field, placeholder, examination, setExamination }: {
  side: string; field: ExamFieldKey; placeholder: string;
  examination: any; setExamination: any;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{side}</span>
      <div className="w-32 h-32 rounded-full border-4 border-slate-700 dark:border-slate-400 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-inner">
        <DrawableCanvas
          width={128} height={128}
          existingStrokes={examination[field].strokes}
          onChange={(strokes: Drawing) =>
            setExamination((prev: any) => ({ ...prev, [field]: { ...prev[field], strokes } }))
          }
        />
      </div>
      <input type="text" value={examination[field].value} placeholder={placeholder}
        onChange={(e) =>
          setExamination((prev: any) => ({ ...prev, [field]: { ...prev[field], value: e.target.value } }))
        }
        className="w-32 px-2.5 py-1.5 rounded-lg text-xs text-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 transition-all"
      />
    </div>
  );
}