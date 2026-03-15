"use client";

import {
  Stethoscope,
  ClipboardList,
  FileText,
  Ear,
  Save,
  Printer,
  Activity,
  Eye,
  Check,
} from "lucide-react";
import React, { useState } from "react";
 import { ToastContainer, toast } from 'react-toastify';
//  import "react-toastify/dist/ReactToastify.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type DiagnosisKey =
  | "normal" | "wax" | "oe" | "myringitis" | "etDysfunction"
  | "glue" | "aom" | "chl" | "snhl" | "csomMucosal"
  | "csomSquamous" | "unclassified";

type EarSide = "R" | "L" | "Bilat" | "";

interface Procedures {
  syringingR: boolean;
  microscopeExam: boolean;
  nasoendoscopy: boolean;
}

interface AudiologyTests {
  ptAudio: boolean;
  tympanometry: boolean;
  stapedialReflexes: boolean;
  speechAudio: boolean;
  oae: boolean;
  abr: boolean;
  vestibularTest: boolean;
}

interface AudiologyTreatment {
  hearingAid: boolean;
  hearingAidReview: boolean;
  hearingTinnitusRehab: boolean;
  speechLanguage: boolean;
  assessmentRehab: boolean;
}

interface Diagnosis {
  normal: EarSide;
  wax: EarSide;
  oe: EarSide;
  myringitis: EarSide;
  etDysfunction: EarSide;
  glue: EarSide;
  aom: EarSide;
  chl: EarSide;
  snhl: EarSide;
  csomMucosal: EarSide;
  csomSquamous: EarSide;
  unclassified: EarSide;
  vertigoBalance: boolean;
  tinnitus: boolean;
  other: string;
}

interface FormProps {
  existingNotes?: any;
  router?: any;
}

// ─── Diagnosis list (order matches InvestigationId in DB) ────────────────────
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

// ─── Component ────────────────────────────────────────────────────────────────
const ENTConsultantNotesForm: React.FC<FormProps> = ({ existingNotes, router }) => {

  const [presentComplaint, setPresentComplaint]     = useState("");
  const [pastMedicalHistory, setPastMedicalHistory] = useState("");
  const [notes, setNotes]                           = useState("");
  const [treatmentPlan, setTreatmentPlan]           = useState("");
  const [examination, setExamination]               = useState({ rightEar: "", leftEar: "", rightNose: "", leftNose: "" });

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

  // ─── Side selector helper ──────────────────────────────────────────────────
  const selectSide = (key: DiagnosisKey, side: EarSide) => {
    setDiagnosis(prev => ({
      ...prev,
      [key]: prev[key] === side ? "" : side,
    }));
  };

  // ─── Build DB payload ─────────────────────────────────────────────────────
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

    diagnosisList.forEach((item, index) => {
      const value = diagnosis[item.key];
      if (value) rows.push({ TypeId: 4, InvestigationId: index + 1, Value: value });
    });

    if (diagnosis.vertigoBalance) rows.push({ TypeId: 5, InvestigationId: 1, Value: "1" });
    if (diagnosis.tinnitus)       rows.push({ TypeId: 6, InvestigationId: 1, Value: "1" });

    // rows.push({ TypeId: 7, InvestigationId: 1,  Value: presentComplaint });
    // rows.push({ TypeId: 7, InvestigationId: 2,  Value: pastMedicalHistory });
    // rows.push({ TypeId: 7, InvestigationId: 3,  Value: examination.rightEar });
    // rows.push({ TypeId: 7, InvestigationId: 4,  Value: examination.leftEar });
    // rows.push({ TypeId: 7, InvestigationId: 5,  Value: examination.rightNose });
    // rows.push({ TypeId: 7, InvestigationId: 6,  Value: examination.leftNose });
    // treatmentPlan.forEach((plan, i) => rows.push({ TypeId: 7, InvestigationId: 7 + i, Value: plan }));
    // rows.push({ TypeId: 7, InvestigationId: 11, Value: notes });

    return rows;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    const patientInfo = JSON.parse(sessionStorage.getItem('selectedPatient') || '{}');
    const response = await fetch("/api/patient/ent-notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ patientInfo, payload: buildPayload() })
    })

    const result = await response.json();
    console.log("response:", result);
    if (result.success) {
      toast.success("Notes saved successfully!");
    } else {
      toast.error("Failed to save notes.");
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <form onSubmit={handleSubmit} className="max-w-full space-y-6">
          {/* ── Present Complaint & Past Medical History  ── */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Present Complaint */}
              <div className="flex-1">
                <Label htmlFor="presentComplaint" className="flex items-center gap-2">
                  <ClipboardList size={18} className="text-blue-600" />
                  Present Complaint
                </Label>
                <Textarea
                  id="presentComplaint"
                  value={presentComplaint}
                  onChange={(e: any) => setPresentComplaint(e.target.value)}
                  placeholder="Describe the present complaint..."
                  rows={6}
                  className="mt-2"
                />
              </div>

              {/* Past Medical History */}
              <div className="flex-1">
                <Label htmlFor="pastMedicalHistory" className="flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" />
                  Past Medical History
                </Label>
                <Textarea
                  id="pastMedicalHistory"
                  value={pastMedicalHistory}
                  onChange={(e: any) => setPastMedicalHistory(e.target.value)}
                  placeholder="Past medical history..."
                  rows={6}
                  className="mt-2"
                />
              </div>   
                      
            </div>
          </CardContent>
        </Card>
        {/* ── Procedures ── */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-6">
              

              {/* Procedures + Audiology Investigations */}
              <div className="flex-1 flex flex-col">
                <Label className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Stethoscope size={20} className="text-blue-600" />
                  Procedure
                </Label>
                <div className="flex flex-col gap-3 border rounded-lg p-4">
                  {[
                    { id: "syringingR",    key: "syringingR",    label: "Syringing R/L (Wax drops First, if __day)" },
                    { id: "microscopeExam",key: "microscopeExam",label: "Micro-scope exam (MSE)" },
                    { id: "nasoendoscopy", key: "nasoendoscopy", label: "Nasoendoscopy (NE)" },
                  ].map(({ id, key, label }) => (
                    <div key={id} className="flex items-center gap-2">
                      <Checkbox
                        id={id}
                        checked={(procedures as any)[key]}
                        onCheckedChange={(checked: boolean) =>
                          setProcedures({ ...procedures, [key]: checked })
                        }
                      />
                      <Label htmlFor={id} className="cursor-pointer mb-0">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <Label className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Activity size={20} className="text-blue-600" />
                  Audiology Investigations
                </Label>
                <div className="flex flex-col gap-3 border rounded-lg p-4 ">
                  {[
                    { id: "ptAudio",           key: "ptAudio",           label: "PT Audio" },
                    { id: "tympanometry",      key: "tympanometry",      label: "Tympanometry" },
                    { id: "stapedialReflexes", key: "stapedialReflexes", label: "Stapedial reflexes" },
                    { id: "speechAudio",       key: "speechAudio",       label: "Speech audio" },
                    { id: "oae",               key: "oae",               label: "OAE" },
                    { id: "abr",               key: "abr",               label: "ABR" },
                    { id: "vestibularTest",    key: "vestibularTest",    label: "VESTIBULAR FUNCTION TESTS" },
                  ].map(({ id, key, label }) => (
                    <div key={id} className="flex items-center gap-2">
                      <Checkbox
                        id={id}
                        checked={(audiologyTests as any)[key]}
                        onCheckedChange={(checked: boolean) =>
                          setAudiologyTests({ ...audiologyTests, [key]: checked })
                        }
                      />
                      <Label htmlFor={id} className="cursor-pointer mb-0">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              {/* Audiology Treatment */}
              <div className="flex-1">
                <Label className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Stethoscope size={20} className="text-blue-600" />
                  Audiology Treatment
                </Label>
                <div className="flex flex-col gap-3 border rounded-lg p-4 ">
                  {[
                    { id: "hearingAid",          key: "hearingAid",          label: "Hearing aid" },
                    { id: "hearingAidReview",     key: "hearingAidReview",    label: "Hearing aid review/repair" },
                    { id: "hearingTinnitusRehab", key: "hearingTinnitusRehab",label: "Hearing/tinnitus rehab." },
                    { id: "speechLanguage",       key: "speechLanguage",      label: "Speech and language" },
                    { id: "assessmentRehab",      key: "assessmentRehab",     label: "Assessment/rehab." },
                  ].map(({ id, key, label }) => (
                    <div key={id} className="flex items-center gap-2">
                      <Checkbox
                        id={id}
                        checked={(audiologyTreatment as any)[key]}
                        onCheckedChange={(checked: boolean) =>
                          setAudiologyTreatment({ ...audiologyTreatment, [key]: checked })
                        }
                      />
                      <Label htmlFor={id} className="cursor-pointer mb-0">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Examination  & Main Diagnosis── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye size={24} className="text-blue-600" />
              Examination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-8">

              {/* Ear diagram */}
              <div className="flex-1">
                <Label className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Ear size={20} className="text-blue-600" />
                  Ear Examination
                </Label>
                <div className="flex justify-around items-center mb-4">
                  {[
                    { side: "R", field: "rightEar", placeholder: "VII" },
                    { side: "L", field: "leftEar",  placeholder: "512" },
                  ].map(({ side, field, placeholder }) => (
                    <div key={side} className="flex flex-col items-center">
                      <div className="w-32 h-32 border-4 border-gray-800 rounded-full mb-2 flex items-center justify-center bg-gray-50">
                        <Ear size={48} className="text-gray-300" />
                      </div>
                      <div className="text-sm font-semibold">{side}</div>
                      <Input
                        value={(examination as any)[field]}
                        onChange={(e: any) => setExamination({ ...examination, [field]: e.target.value })}
                        placeholder={placeholder}
                        className="mt-2 w-32"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-around mt-4">
                  {[
                    { side: "R", field: "rightNose", placeholder: "Nose R" },
                    { side: "L", field: "leftNose",  placeholder: "Nose L" },
                  ].map(({ side, field, placeholder }) => (
                    <div key={side} className="flex flex-col items-center">
                      <Label>{side}</Label>
                      <Input
                        value={(examination as any)[field]}
                        onChange={(e: any) => setExamination({ ...examination, [field]: e.target.value })}
                        placeholder={placeholder}
                        className="mt-2 w-32"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Diagnosis */}
              <div className="flex-1">
                <Label className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <ClipboardList size={20} className="text-blue-600" />
                  Main Diagnosis (for each ear R / L / Bilat)
                </Label>

                <div className="border rounded-lg p-4 flex flex-col gap-2">

                  {/* Column header row */}
                  <div className="flex items-center pb-1 border-b border-gray-200">
                    <span className="flex-1 text-xs font-semibold text-gray-500">Diagnosis</span>
                    <span className="w-10 text-center text-xs font-semibold text-gray-500">R</span>
                    <span className="w-10 text-center text-xs font-semibold text-gray-500">L</span>
                    <span className="w-14 text-center text-xs font-semibold text-gray-500">Bilat</span>
                  </div>

                  {/* Diagnosis rows */}
                  {diagnosisList.map((item) => (
                    <div key={item.key} className="flex items-center py-0.5">
                      <span className={`flex-1 text-sm ${diagnosis[item.key] ? "font-semibold text-blue-700" : "text-gray-700"}`}>
                        {item.label}
                      </span>
                      {(["R", "L", "Bilat"] as EarSide[]).map((side) => (
                        <div key={side} className={`flex justify-center ${side === "Bilat" ? "w-14" : "w-10"}`}>
                          <button
                            type="button"
                            onClick={() => selectSide(item.key, side)}
                            className={`w-6 h-6 rounded-full border-2 transition-colors flex items-center justify-center
                              ${diagnosis[item.key] === side
                                ? "bg-blue-600 border-blue-600"
                                : "bg-white border-gray-300 hover:border-blue-400"
                              }`}
                          >
                            {diagnosis[item.key] === side && <Check size={12} className="text-white" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Vertigo / Tinnitus */}
                  <div className="flex gap-6 pt-3 border-t border-gray-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={diagnosis.vertigoBalance}
                        onCheckedChange={(v: boolean) => setDiagnosis({ ...diagnosis, vertigoBalance: v })}
                      />
                      <span className="text-sm">Vertigo / Balance</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={diagnosis.tinnitus}
                        onCheckedChange={(v: boolean) => setDiagnosis({ ...diagnosis, tinnitus: v })}
                      />
                      <span className="text-sm">Tinnitus</span>
                    </label>
                  </div>

                  {/* Other */}
                  <Input
                    placeholder="Other diagnosis..."
                    value={diagnosis.other}
                    onChange={(e: any) => setDiagnosis({ ...diagnosis, other: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* ── Treatment Plan & Notes ── */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-6">

              {/* Treatment Plan */}
              <div className="flex-1">
                <Label htmlFor="treatmentPlan" className="flex items-center gap-2">
                  <ClipboardList size={18} className="text-blue-600" />
                  Treatment Plans
                </Label>
                <Textarea
                  id="treatmentPlan"
                  value={notes}
                  onChange={(e: any) => setTreatmentPlan(e.target.value)}
                  placeholder="Treatment plan..."
                  rows={10}
                  className="mt-2"
                />
              </div>

              {/* Notes */}
              <div className="flex-1">
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" />
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e: any) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  rows={10}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Buttons ── */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" icon={Printer} onClick={() => window.print()}>
            Print
          </Button>
          <Button type="submit" icon={Save}>
            Save Consultant Notes
          </Button>
        </div>
      </form>
    </>
  );
};

export default ENTConsultantNotesForm;

// ─── UI primitives ────────────────────────────────────────────────────────────

const Button = ({ children, className = "", variant = "primary", icon: Icon, ...props }: any) => {
  const base = "px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors font-medium flex items-center gap-2 justify-center";
  const variants: any = {
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  };
  return (
    <button className={`${base} ${variants[variant] ?? variants.primary} ${className}`} {...props}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }: any) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = "" }: any) => (
  <div className={`p-6 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = "" }: any) => (
  <h3 className={`text-2xl font-semibold text-gray-900 ${className}`}>{children}</h3>
);
const CardContent = ({ children, className = "" }: any) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);
const Label = ({ children, htmlFor, className = "" }: any) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-2 ${className}`}>
    {children}
  </label>
);
const Input = ({ className = "", icon: Icon, ...props }: any) => (
  <div className="relative">
    {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon size={18} /></div>}
    <input
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${Icon ? "pl-10" : ""} ${className}`}
      {...props}
    />
  </div>
);
const Checkbox = ({ checked, onCheckedChange, id, className = "" }: any) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    id={id}
    className={`w-5 h-5 border-2 border-gray-300 rounded flex items-center justify-center cursor-pointer transition-colors ${
      checked ? "bg-blue-600 border-blue-600" : "bg-white"
    } ${className}`}
  >
    {checked && <Check size={14} className="text-white" />}
  </button>
);
const Textarea = ({ className = "", ...props }: any) => (
  <textarea
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${className}`}
    {...props}
  />
);