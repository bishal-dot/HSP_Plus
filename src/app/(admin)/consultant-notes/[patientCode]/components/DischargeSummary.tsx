"use client";

import { useEffect, useState } from "react";
import { useAuthToken } from "@/context/AuthContext";
import { useDischargeSummary } from "../queries/dischargeSummary.queries";
import { useInsertDischargeSummary } from "../queries/dischargeSummary.mutations";
import {
  CircleOff, Calendar, Stethoscope, Pill, ClipboardList,
  LogOut, Hash, BadgeCheck, BookOpen, Activity, Scissors,
  BedDouble, NotebookPen, HeartPulse, Plus, FileText,
  ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertCircle,
} from "lucide-react";
import Chip from "@/components/form/input/Chip";
import Section from "@/components/form/input/Section";
import SubField from "@/components/form/input/SubField";
import Field from "@/components/form/input/Field";
import Accordion from "@/components/form/input/Accordion";
import TabBtn from "@/components/form/input/TabBtn";

/* ═══════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════ */
interface Props {
  MrNO: string;
}

interface DischargeFormData {
  DischargeType: string;
  PreOPDiagnosis: string;
  Diagnosis: string;
  /* History */
  CO: string;
  HOPI: string;
  PastHistory: string;
  PersonalHistory: string;
  /* On Examination - Admission */
  OE: string;
  GC: string;
  PICCLED: string;
  SE: string;
  CHEST: string;
  CBS: string;
  CNS: string;
  PA: string;
  OEFreeBox: string;
  /* OT */
  OTFinding: string;
  /* Course of Hospital Stay */
  COHStay: string;
  TDHSFreeBox: string;
  TDHSOTNote: string;
  TDHSPTNote: string;
  TDHSTNote: string;
  /* At Discharge Examination */
  AOE: string;
  AGC: string;
  APICCLED: string;
  ASE: string;
  ACHEST: string;
  ACBS: string;
  ACNS: string;
  APA: string;
  /* At Discharge Notes */
  AODOTNote: string;
  AODPTNote: string;
  AODSTNote: string;
  AODNursingNote: string;
  /* Medications & Advice */
  RX: string;
  ADVICE: string;
}

const EMPTY_FORM: DischargeFormData = {
  DischargeType: "", PreOPDiagnosis: "", Diagnosis: "",
  CO: "", HOPI: "", PastHistory: "", PersonalHistory: "",
  OE: "", GC: "", PICCLED: "", SE: "", CHEST: "", CBS: "", CNS: "", PA: "", OEFreeBox: "",
  OTFinding: "",
  COHStay: "", TDHSFreeBox: "", TDHSOTNote: "", TDHSPTNote: "", TDHSTNote: "",
  AOE: "", AGC: "", APICCLED: "", ASE: "", ACHEST: "", ACBS: "", ACNS: "", APA: "",
  AODOTNote: "", AODPTNote: "", AODSTNote: "", AODNursingNote: "",
  RX: "", ADVICE: "",
};

const DISCHARGE_TYPES = [
  "Cured", "Improved", "LAMA (Left Against Medical Advice)",
  "Referred", "Expired", "Absconded",
];

/* ═══════════════════════════════════════════════════
   MAIN WRAPPER
═══════════════════════════════════════════════════ */
const IPDDischargeRecord: React.FC<Props> = ({ MrNO }) => {
  const [activeTab, setActiveTab] = useState<"summary" | "form">("summary");

  return (
    <div className="space-y-3">

      {/* ── Tab bar ── */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 w-fit">
        <TabBtn
          active={activeTab === "summary"}
          onClick={() => setActiveTab("summary")}
          icon={<FileText className="w-3.5 h-3.5" />}
          label="Discharge Summary"
        />
        <TabBtn
          active={activeTab === "form"}
          onClick={() => setActiveTab("form")}
          icon={<Plus className="w-3.5 h-3.5" />}
          label="Add Discharge Record"
        />
      </div>

      {/* ── Panels ── */}
      {activeTab === "summary" ? (
        <IPDDischargeSummary MrNO={MrNO} />
      ) : (
        <IPDDischargeForm MrNO={MrNO} onSuccess={() => setActiveTab("summary")} />
      )}
    </div>
  );
};


const IPDDischargeSummary: React.FC<Props> = ({ MrNO }) => {
  const { authToken } = useAuthToken();
  const { data: dischargeSummary, isLoading } = useDischargeSummary(authToken, MrNO);

  const formatList = (text: string) => {
    if (!text) return [];
    return text.split("\n").map((i) => i.trim()).filter(Boolean);
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 flex items-center justify-center animate-pulse">
        <LogOut className="w-5 h-5 text-violet-500 dark:text-violet-400" />
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500">Loading discharge summary…</p>
    </div>
  );

  if (!dischargeSummary || dischargeSummary.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
        <CircleOff className="w-6 h-6 text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No Discharge Summary Available</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">No records found for this patient</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {dischargeSummary.map((summary: any, index: number) => (
        <div key={index} className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none overflow-hidden">
          <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-purple-400 to-violet-400" />
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30">
                <LogOut className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">Discharge Summary</h2>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Full patient discharge record</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Chip icon={<Calendar className="w-3 h-3" />} label={summary.Date} />
              <Chip icon={<Hash className="w-3 h-3" />} label={`IPD: ${summary.IPDCode}`} />
              {summary.DischargeType && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                  <BadgeCheck className="w-3 h-3" />{summary.DischargeType}
                </span>
              )}
            </div>
          </div>
          <div className="p-5 space-y-4">
            <Section icon={<Stethoscope className="w-4 h-4" />} title="Diagnosis" color="blue">
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{summary.Diagnosis || "—"}</p>
              {summary.PreOPDiagnosis && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5"><span className="font-semibold">Pre-Op:</span> {summary.PreOPDiagnosis}</p>}
            </Section>
            {(summary.CO || summary.HOPI || summary.PastHistory || summary.PersonalHistory) && (
              <Section icon={<BookOpen className="w-4 h-4" />} title="History" color="amber">
                <div className="space-y-2.5">
                  <SubField label="Chief Complaints (C/O)" value={summary.CO} />
                  <SubField label="History of Present Illness" value={summary.HOPI} />
                  <SubField label="Past History" value={summary.PastHistory} />
                  <SubField label="Personal History" value={summary.PersonalHistory} />
                </div>
              </Section>
            )}
            {(summary.OE || summary.GC || summary.PICCLED || summary.SE || summary.CHEST || summary.CBS || summary.CNS || summary.PA || summary.OEFreeBox) && (
              <Section icon={<Activity className="w-4 h-4" />} title="On Examination (Admission)" color="blue">
                <div className="space-y-2.5">
                  <SubField label="O/E" value={summary.OE} />
                  <SubField label="General Condition" value={summary.GC} />
                  <SubField label="PICCLED" value={summary.PICCLED} />
                  <SubField label="Systemic Examination" value={summary.SE} />
                  <SubField label="Chest / RS" value={summary.CHEST} />
                  <SubField label="CVS" value={summary.CBS} />
                  <SubField label="CNS" value={summary.CNS} />
                  <SubField label="Per Abdomen" value={summary.PA} />
                  <SubField label="Additional Notes" value={summary.OEFreeBox} />
                </div>
              </Section>
            )}
            {summary.OTFinding && (
              <Section icon={<Scissors className="w-4 h-4" />} title="OT / Operative Findings" color="rose">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{summary.OTFinding}</p>
              </Section>
            )}
            {(summary.COHStay || summary.TDHSFreeBox || summary.TDHSOTNote || summary.TDHSPTNote || summary.TDHSTNote) && (
              <Section icon={<BedDouble className="w-4 h-4" />} title="Course of Hospital Stay" color="violet">
                <div className="space-y-2.5">
                  <SubField label="Summary" value={summary.COHStay} />
                  <SubField label="General Notes" value={summary.TDHSFreeBox} />
                  <SubField label="OT Notes" value={summary.TDHSOTNote} />
                  <SubField label="Physiotherapy Notes" value={summary.TDHSPTNote} />
                  <SubField label="Treatment Notes" value={summary.TDHSTNote} />
                </div>
              </Section>
            )}
            {(summary.AOE || summary.AGC || summary.APICCLED || summary.ASE || summary.ACHEST || summary.ACBS || summary.ACNS || summary.APA) && (
              <Section icon={<HeartPulse className="w-4 h-4" />} title="At Discharge Examination" color="emerald">
                <div className="space-y-2.5">
                  <SubField label="O/E" value={summary.AOE} />
                  <SubField label="General Condition" value={summary.AGC} />
                  <SubField label="PICCLED" value={summary.APICCLED} />
                  <SubField label="Systemic Examination" value={summary.ASE} />
                  <SubField label="Chest / RS" value={summary.ACHEST} />
                  <SubField label="CVS" value={summary.ACBS} />
                  <SubField label="CNS" value={summary.ACNS} />
                  <SubField label="Per Abdomen" value={summary.APA} />
                </div>
              </Section>
            )}
            {(summary.AODOTNote || summary.AODPTNote || summary.AODSTNote || summary.AODNursingNote) && (
              <Section icon={<NotebookPen className="w-4 h-4" />} title="At Discharge Notes" color="teal">
                <div className="space-y-2.5">
                  <SubField label="OT Notes" value={summary.AODOTNote} />
                  <SubField label="Physiotherapy Notes" value={summary.AODPTNote} />
                  <SubField label="Speech Therapy Notes" value={summary.AODSTNote} />
                  <SubField label="Nursing Notes" value={summary.AODNursingNote} />
                </div>
              </Section>
            )}
            {formatList(summary.RX).length > 0 && (
              <Section icon={<Pill className="w-4 h-4" />} title="Medications (Rx)" color="violet">
                <ul className="space-y-1.5">
                  {formatList(summary.RX).map((rx: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 dark:bg-violet-500 flex-shrink-0" />{rx}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {formatList(summary.ADVICE).length > 0 && (
              <Section icon={<ClipboardList className="w-4 h-4" />} title="Advice" color="emerald">
                <ul className="space-y-1.5">
                  {formatList(summary.ADVICE).map((adv: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 flex-shrink-0" />{adv}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   INSERT FORM
═══════════════════════════════════════════════════ */
const IPDDischargeForm: React.FC<{ MrNO: string; onSuccess: () => void }> = ({ MrNO, onSuccess }) => {
  const { authToken } = useAuthToken();
  const [patientInfo, setPatientInfo] = useState<any>(null);
    useEffect(() => {
        const stored = sessionStorage.getItem("selectedPatient");
        if (stored) setPatientInfo(JSON.parse(stored));
      }, []);
    
  const patientNo = patientInfo?.IPDCODE;
  
  const { mutateAsync: insertDischarge, isPending, isError, isSuccess } = useInsertDischargeSummary();

  const [form, setForm] = useState<DischargeFormData>(EMPTY_FORM);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    diagnosis: true,
    history: false,
    oe_admission: false,
    ot: false,
    course: false,
    oe_discharge: false,
    aod_notes: false,
    rx: true,
    advice: true,
  });

  const set = (field: keyof DischargeFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = async () => {
    if (!authToken) return;
    try {
      await insertDischarge({ authToken, MrNO, IPDCode: patientNo, userId: patientInfo.Tokenid, ...form });
      onSuccess();
    } catch (e:any) {
      console.error(e);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none overflow-hidden">
      {/* Top accent */}
      <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400" />

      {/* Form header */}
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30">
          <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">New Discharge Record</h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">MR No: {MrNO}</p>
        </div>
      </div>

      <div className="p-5 space-y-3">

        {/* ── IPD Code + Discharge Type ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="IPD Code" required>
            <input type="text" placeholder="IPD Code" value={patientNo} readOnly className={inputCls} />
          </Field>
          <Field label="Discharge Type" required>
            <select value={form.DischargeType} onChange={set("DischargeType")} className={inputCls}>
              <option value="">Select type…</option>
              {DISCHARGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>

        {/* ── DIAGNOSIS ── */}
        <Accordion
          icon={<Stethoscope className="w-4 h-4" />}
          title="Diagnosis"
          color="blue"
          open={openSections.diagnosis}
          onToggle={() => toggleSection("diagnosis")}
        >
          <Field label="Diagnosis" required>
            <textarea rows={3} placeholder="Final diagnosis…" value={form.Diagnosis} onChange={set("Diagnosis")} className={textareaCls} />
          </Field>
          <Field label="Pre-Operative Diagnosis">
            <textarea rows={2} placeholder="Pre-op diagnosis if applicable…" value={form.PreOPDiagnosis} onChange={set("PreOPDiagnosis")} className={textareaCls} />
          </Field>
        </Accordion>

        {/* ── HISTORY ── */}
        <Accordion
          icon={<BookOpen className="w-4 h-4" />}
          title="History"
          color="amber"
          open={openSections.history}
          onToggle={() => toggleSection("history")}
        >
          <Field label="Chief Complaints (C/O)">
            <textarea rows={2} placeholder="Presenting complaints…" value={form.CO} onChange={set("CO")} className={textareaCls} />
          </Field>
          <Field label="History of Present Illness (HOPI)">
            <textarea rows={3} placeholder="Detailed history…" value={form.HOPI} onChange={set("HOPI")} className={textareaCls} />
          </Field>
          <Field label="Past History">
            <textarea rows={2} placeholder="Previous illnesses, surgeries…" value={form.PastHistory} onChange={set("PastHistory")} className={textareaCls} />
          </Field>
          <Field label="Personal History">
            <textarea rows={2} placeholder="Lifestyle, habits…" value={form.PersonalHistory} onChange={set("PersonalHistory")} className={textareaCls} />
          </Field>
        </Accordion>

        {/* ── ON EXAMINATION (ADMISSION) ── */}
        <Accordion
          icon={<Activity className="w-4 h-4" />}
          title="On Examination — Admission"
          color="blue"
          open={openSections.oe_admission}
          onToggle={() => toggleSection("oe_admission")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="On Examination (O/E)">
              <textarea rows={2} value={form.OE} onChange={set("OE")} className={textareaCls} />
            </Field>
            <Field label="General Condition (G/C)">
              <textarea rows={2} value={form.GC} onChange={set("GC")} className={textareaCls} />
            </Field>
            <Field label="PICCLED">
              <textarea rows={2} placeholder="Pallor / Icterus / Cyanosis…" value={form.PICCLED} onChange={set("PICCLED")} className={textareaCls} />
            </Field>
            <Field label="Systemic Examination (S/E)">
              <textarea rows={2} value={form.SE} onChange={set("SE")} className={textareaCls} />
            </Field>
            <Field label="Chest / RS">
              <textarea rows={2} value={form.CHEST} onChange={set("CHEST")} className={textareaCls} />
            </Field>
            <Field label="Cardiovascular System (CVS)">
              <textarea rows={2} value={form.CBS} onChange={set("CBS")} className={textareaCls} />
            </Field>
            <Field label="Central Nervous System (CNS)">
              <textarea rows={2} value={form.CNS} onChange={set("CNS")} className={textareaCls} />
            </Field>
            <Field label="Per Abdomen (P/A)">
              <textarea rows={2} value={form.PA} onChange={set("PA")} className={textareaCls} />
            </Field>
          </div>
          <Field label="Additional Examination Notes">
            <textarea rows={2} placeholder="Free text…" value={form.OEFreeBox} onChange={set("OEFreeBox")} className={textareaCls} />
          </Field>
        </Accordion>

        {/* ── OT FINDINGS ── */}
        <Accordion
          icon={<Scissors className="w-4 h-4" />}
          title="OT / Operative Findings"
          color="rose"
          open={openSections.ot}
          onToggle={() => toggleSection("ot")}
        >
          <Field label="OT Finding">
            <textarea rows={4} placeholder="Intraoperative findings…" value={form.OTFinding} onChange={set("OTFinding")} className={textareaCls} />
          </Field>
        </Accordion>

        {/* ── COURSE OF HOSPITAL STAY ── */}
        <Accordion
          icon={<BedDouble className="w-4 h-4" />}
          title="Course of Hospital Stay"
          color="violet"
          open={openSections.course}
          onToggle={() => toggleSection("course")}
        >
          <Field label="Course of Hospital Stay">
            <textarea rows={4} placeholder="Summary of inpatient treatment…" value={form.COHStay} onChange={set("COHStay")} className={textareaCls} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="General Notes">
              <textarea rows={2} value={form.TDHSFreeBox} onChange={set("TDHSFreeBox")} className={textareaCls} />
            </Field>
            <Field label="OT Notes">
              <textarea rows={2} value={form.TDHSOTNote} onChange={set("TDHSOTNote")} className={textareaCls} />
            </Field>
            <Field label="Physiotherapy Notes">
              <textarea rows={2} value={form.TDHSPTNote} onChange={set("TDHSPTNote")} className={textareaCls} />
            </Field>
            <Field label="Treatment Notes">
              <textarea rows={2} value={form.TDHSTNote} onChange={set("TDHSTNote")} className={textareaCls} />
            </Field>
          </div>
        </Accordion>

        {/* ── AT DISCHARGE EXAMINATION ── */}
        <Accordion
          icon={<HeartPulse className="w-4 h-4" />}
          title="At Discharge Examination"
          color="emerald"
          open={openSections.oe_discharge}
          onToggle={() => toggleSection("oe_discharge")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="On Examination (O/E)">
              <textarea rows={2} value={form.AOE} onChange={set("AOE")} className={textareaCls} />
            </Field>
            <Field label="General Condition (G/C)">
              <textarea rows={2} value={form.AGC} onChange={set("AGC")} className={textareaCls} />
            </Field>
            <Field label="PICCLED">
              <textarea rows={2} value={form.APICCLED} onChange={set("APICCLED")} className={textareaCls} />
            </Field>
            <Field label="Systemic Examination (S/E)">
              <textarea rows={2} value={form.ASE} onChange={set("ASE")} className={textareaCls} />
            </Field>
            <Field label="Chest / RS">
              <textarea rows={2} value={form.ACHEST} onChange={set("ACHEST")} className={textareaCls} />
            </Field>
            <Field label="Cardiovascular System (CVS)">
              <textarea rows={2} value={form.ACBS} onChange={set("ACBS")} className={textareaCls} />
            </Field>
            <Field label="Central Nervous System (CNS)">
              <textarea rows={2} value={form.ACNS} onChange={set("ACNS")} className={textareaCls} />
            </Field>
            <Field label="Per Abdomen (P/A)">
              <textarea rows={2} value={form.APA} onChange={set("APA")} className={textareaCls} />
            </Field>
          </div>
        </Accordion>

        {/* ── AT DISCHARGE NOTES ── */}
        <Accordion
          icon={<NotebookPen className="w-4 h-4" />}
          title="At Discharge Notes"
          color="teal"
          open={openSections.aod_notes}
          onToggle={() => toggleSection("aod_notes")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="OT Notes">
              <textarea rows={2} value={form.AODOTNote} onChange={set("AODOTNote")} className={textareaCls} />
            </Field>
            <Field label="Physiotherapy Notes">
              <textarea rows={2} value={form.AODPTNote} onChange={set("AODPTNote")} className={textareaCls} />
            </Field>
            <Field label="Speech Therapy Notes">
              <textarea rows={2} value={form.AODSTNote} onChange={set("AODSTNote")} className={textareaCls} />
            </Field>
            <Field label="Nursing Notes">
              <textarea rows={2} value={form.AODNursingNote} onChange={set("AODNursingNote")} className={textareaCls} />
            </Field>
          </div>
        </Accordion>

        {/* ── MEDICATIONS ── */}
        <Accordion
          icon={<Pill className="w-4 h-4" />}
          title="Medications (Rx)"
          color="violet"
          open={openSections.rx}
          onToggle={() => toggleSection("rx")}
        >
          <Field label="Prescriptions" hint="Enter each medication on a new line">
            <textarea
              rows={5}
              placeholder={"Tab. Amoxicillin 500mg TDS × 5 days\nInj. Pantoprazole 40mg OD"}
              value={form.RX}
              onChange={set("RX")}
              className={textareaCls}
            />
          </Field>
        </Accordion>

        {/* ── ADVICE ── */}
        <Accordion
          icon={<ClipboardList className="w-4 h-4" />}
          title="Advice"
          color="emerald"
          open={openSections.advice}
          onToggle={() => toggleSection("advice")}
        >
          <Field label="Discharge Advice" hint="Enter each instruction on a new line">
            <textarea
              rows={5}
              placeholder={"Rest for 2 weeks\nWound dressing daily\nFollow-up after 7 days"}
              value={form.ADVICE}
              onChange={set("ADVICE")}
              className={textareaCls}
            />
          </Field>
        </Accordion>

        {/* ── Status messages ── */}
        {isError && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Failed to save discharge record. Please try again.
          </div>
        )}

        {/* ── Submit ── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={isPending || !patientInfo?.IPDCODE || !form.DischargeType || !form.Diagnosis}
            className="
              inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
              text-xs font-bold text-white
              bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-150
            "
          >
            {isPending ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
            ) : (
              <><CheckCircle2 className="w-3.5 h-3.5" /> Save Discharge Record</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};


/* ── Shared class strings ── */
const inputCls = `
  w-full px-3 py-2 rounded-lg text-xs
  bg-slate-50 dark:bg-slate-800/60
  border border-slate-200 dark:border-slate-700/60
  text-slate-800 dark:text-slate-100
  placeholder:text-slate-300 dark:placeholder:text-slate-600
  focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400
  dark:focus:ring-violet-500/30 dark:focus:border-violet-500
  transition-colors
`;

const textareaCls = `${inputCls} resize-none`;

export default IPDDischargeRecord;