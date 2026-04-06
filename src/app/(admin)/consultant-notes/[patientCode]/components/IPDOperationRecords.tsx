"use client";

import { useEffect, useState } from "react";
import { useAuthToken } from "@/context/AuthContext";
import { useOperationRecord } from "../queries/operaationrecord.queries";
import { useInsertOperationRecord } from "../queries/operationrecord.mutations";
import {
  CircleOff, CalendarDays, User, Stethoscope, Scissors,
  ClipboardList, Users, BadgeInfo, ShieldPlus, Plus, FileText,
  ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertCircle,
  Clock, Droplets, FlaskConical, Microscope, Wrench, Layers,
  NotebookPen, Activity, Hash,
} from "lucide-react";
import Chip from "@/components/form/input/Chip";
import Section from "@/components/form/input/Section";
import SubField from "@/components/form/input/SubField";
import Field from "@/components/form/input/Field";
import Accordion from "@/components/form/input/Accordion";
import TabBtn from "@/components/form/input/TabBtn";
import DatePicker from "react-datepicker";

/* ═══════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════ */
interface Props {
  PatientCode: string;
  MrNO: string;
}

interface OperationFormData {
  Otdate: string;
  Starttime: string;
  EndTime: string;
  SkinIncisionTime: string;
  SkinClosureTime: string;
  /* Diagnosis */
  PreOPDiagnosis: string;
  PostOpDiagnosis: string;
  Diagnosis: string;
  /* Surgery */
  Op_Preposed: string;
  Op_Executed: string;
  Surgery: string;
  SurgeryGroup: string;
  OTProcedure: string;
  anesthesiaGroup: string;
  /* Intraoperative */
  BloodLoss: string;
  Counts: string;
  IIUsage: string;
  Closure: string;
  /* Specimens */
  CultureSensitivity: string;
  BIOPSY: string;
  Histopathology: string;
  IMPLANT: string;
  /* Admin */
  REMARKS: string;
  memberRole: string;
}

const EMPTY_FORM: OperationFormData = {
  Otdate: "", Starttime: "", EndTime: "",
  SkinIncisionTime: "", SkinClosureTime: "",
  PreOPDiagnosis: "", PostOpDiagnosis: "", Diagnosis: "",
  Op_Preposed: "", Op_Executed: "", Surgery: "", SurgeryGroup: "",
  OTProcedure: "", anesthesiaGroup: "",
  BloodLoss: "", Counts: "", IIUsage: "", Closure: "",
  CultureSensitivity: "", BIOPSY: "", Histopathology: "", IMPLANT: "",
  REMARKS: "", memberRole: "",
};

/* ═══════════════════════════════════════════════════
   MAIN WRAPPER
═══════════════════════════════════════════════════ */
const IPDOperationRecord: React.FC<Props> = ({ PatientCode, MrNO }) => {
  const [activeTab, setActiveTab] = useState<"summary" | "form">("summary");

  return (
    <div className="space-y-3">
      {/* ── Tab bar ── */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 w-fit">
        <TabBtn
          active={activeTab === "summary"}
          onClick={() => setActiveTab("summary")}
          icon={<FileText className="w-3.5 h-3.5" />}
          label="Operation Records"
        />
        <TabBtn
          active={activeTab === "form"}
          onClick={() => setActiveTab("form")}
          icon={<Plus className="w-3.5 h-3.5" />}
          label="Add Operation Record"
        />
      </div>

      {activeTab === "summary" ? (
        <IPDOperationRecords PatientCode={PatientCode} />
      ) : (
        <IPDOperationForm MrNO={MrNO} onSuccess={() => setActiveTab("summary")} />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   SUMMARY VIEWER  (enhanced from original)
═══════════════════════════════════════════════════ */
const IPDOperationRecords: React.FC<{ PatientCode: string }> = ({ PatientCode }) => {
  const { authToken } = useAuthToken();
  const { data: operationRecords, isLoading } = useOperationRecord(authToken, PatientCode ?? null);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 flex items-center justify-center animate-pulse">
        <Scissors className="w-5 h-5 text-rose-500 dark:text-rose-400" />
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500">Loading operation records…</p>
    </div>
  );

  if (!operationRecords || operationRecords.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
        <CircleOff className="w-6 h-6 text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No Operation Records</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">No records found for this patient</p>
    </div>
  );

  const hasValue = (val: any) => val !== null && val !== undefined && String(val).trim() !== "";

  return (
    <div className="space-y-4">
      {operationRecords.map((op: any, index) => (
        <div
          key={`${op.OperationId}-${index}`}
          className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none overflow-hidden"
        >
          <div className="h-0.5 w-full bg-gradient-to-r from-rose-500 via-pink-400 to-rose-400" />

          {/* Card header */}
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30">
                <Scissors className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {op.Op_Executed || "Operation"}
                </h2>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Operation Record</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Chip icon={<CalendarDays className="w-3 h-3" />} label={op.Otdate ?? op.Date} />
              {op.Starttime && op.EndTime && (
                <Chip icon={<Clock className="w-3 h-3" />} label={`${op.Starttime} – ${op.EndTime}`} />
              )}
              {op.IPDCode && <Chip icon={<Hash className="w-3 h-3" />} label={`IPD: ${op.IPDCode}`} />}
              {op.TeamMember && <Chip icon={<User className="w-3 h-3" />} label={op.TeamMember} />}
            </div>
          </div>

          <div className="p-5 space-y-4">

            {/* Pre / Post Diagnosis */}
            <div className="grid md:grid-cols-2 gap-4">
              <Section icon={<Stethoscope className="w-4 h-4" />} title="Pre-Op Diagnosis" color="blue">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{op.PreOPDiagnosis || "—"}</p>
              </Section>
              <Section icon={<ShieldPlus className="w-4 h-4" />} title="Post-Op Diagnosis" color="emerald">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{op.PostOpDiagnosis || "—"}</p>
              </Section>
            </div>

            {/* Surgery Info */}
            {(hasValue(op.Op_Preposed) || hasValue(op.Surgery) || hasValue(op.SurgeryGroup) || hasValue(op.anesthesiaGroup)) && (
              <Section icon={<Layers className="w-4 h-4" />} title="Surgery Details" color="violet">
                <div className="space-y-2.5">
                  <SubField label="Proposed Operation" value={op.Op_Preposed} />
                  <SubField label="Surgery" value={op.Surgery} />
                  <SubField label="Surgery Group" value={op.SurgeryGroup} />
                  <SubField label="Anaesthesia Group" value={op.anesthesiaGroup} />
                </div>
              </Section>
            )}

            {/* OT Procedure */}
            {hasValue(op.OTProcedure) && (
              <Section icon={<ClipboardList className="w-4 h-4" />} title="OT Procedure" color="rose">
                <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-sans">{op.OTProcedure}</pre>
              </Section>
            )}

            {/* Operation Notes */}
            {hasValue(op.Diagnosis) && (
              <Section icon={<NotebookPen className="w-4 h-4" />} title="Operation Notes" color="rose">
                <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-sans">{op.Diagnosis}</pre>
              </Section>
            )}

            {/* Intraoperative */}
            {(hasValue(op.SkinIncisionTime) || hasValue(op.SkinClosureTime) || hasValue(op.BloodLoss) || hasValue(op.Counts) || hasValue(op.IIUsage) || hasValue(op.Closure)) && (
              <Section icon={<Activity className="w-4 h-4" />} title="Intraoperative Details" color="amber">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <SubField label="Skin Incision Time" value={op.SkinIncisionTime} />
                  <SubField label="Skin Closure Time" value={op.SkinClosureTime} />
                  <SubField label="Blood Loss" value={op.BloodLoss} />
                  <SubField label="Counts" value={op.Counts} />
                  <SubField label="II Usage" value={op.IIUsage} />
                  <SubField label="Closure" value={op.Closure} />
                </div>
              </Section>
            )}

            {/* Specimens */}
            {(hasValue(op.CultureSensitivity) || hasValue(op.BIOPSY) || hasValue(op.Histopathology) || hasValue(op.IMPLANT)) && (
              <Section icon={<FlaskConical className="w-4 h-4" />} title="Specimens & Implant" color="teal">
                <div className="space-y-2.5">
                  <SubField label="Culture & Sensitivity" value={op.CultureSensitivity} />
                  <SubField label="Biopsy" value={op.BIOPSY} />
                  <SubField label="Histopathology" value={op.Histopathology} />
                  <SubField label="Implant" value={op.IMPLANT} />
                </div>
              </Section>
            )}

            {/* Remarks */}
            {hasValue(op.REMARKS) && (
              <Section icon={<BadgeInfo className="w-4 h-4" />} title="Remarks" color="slate">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{op.REMARKS}</p>
              </Section>
            )}

            {/* Footer meta */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { icon: <Users className="w-3 h-3" />,    label: "Group", value: op.Group },
                { icon: <BadgeInfo className="w-3 h-3" />, label: "Role",  value: op.MemberRole },
                { icon: <User className="w-3 h-3" />,      label: "User",  value: op.user },
              ].map(({ icon, label, value }) => value && (
                <div key={label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-[10px]">
                  <span className="text-slate-400 dark:text-slate-500">{icon}</span>
                  <span className="text-slate-400 dark:text-slate-500">{label}:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{value}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   INSERT FORM
═══════════════════════════════════════════════════ */
const IPDOperationForm: React.FC<{ MrNO: string; onSuccess: () => void }> = ({ MrNO, onSuccess }) => {
  const { authToken, username, consultantCode } = useAuthToken();
  const [patientInfo, setPatientInfo] = useState<any>(null);
    useEffect(() => {
        const stored = sessionStorage.getItem("selectedPatient");
        if (stored) setPatientInfo(JSON.parse(stored));
      }, []);
    
  const patientNo = patientInfo?.IPDCODE;
  const patientCode = patientInfo?.MrNO || patientInfo?.PatientCode || patientInfo?.MRNo;

  const { mutateAsync: insertOperation, isPending, isError } = useInsertOperationRecord();

  const [form, setForm] = useState<OperationFormData>(EMPTY_FORM);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true,
    diagnosis: true,
    surgery: true,
    procedure: false,
    intraop: false,
    specimens: false,
    remarks: false,
  });

  const [surgeryGroups, setSurgeryGroups] = useState<{ ServiceCode: string; ServiceName: string }[]>([]);
  const [anesthesiaGroups, setAnesthesiaGroups] = useState<{ ServiceCode: string; ServiceName: string }[]>([]);
  const [otGroups, setOtGroups] = useState<{ Unkid: string; Alias: string }[]>([]);

  useEffect(() => {
    fetch(`/api/masters/services?type=101`)
      .then((res) => res.json())
      .then(setSurgeryGroups)
      .catch(console.error);                              // was: unhandled rejection
  }, []);

  useEffect(() => {
    fetch(`/api/masters/services?type=102`)
      .then((res) => res.json())
      .then(setAnesthesiaGroups)
      .catch(console.error);
  }, []); 
  
  useEffect(() => {
    fetch(`/api/masters/otgroups`)
      .then((res) => res.json())
      .then(setOtGroups)
      .catch(console.error);
  }, [])

  const set = (field: keyof OperationFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggle = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // format time
  const formatTime = (time?: string): string | undefined => {
    if (!time || !time.trim()) return undefined;          // was: only checking .length === 5
    const parts = time.trim().split(":");
    if (parts.length < 2) return undefined;
    return parts.length === 2 ? `${time}:00` : time;
  };

  const handleSubmit = async () => {
    try {
      await insertOperation({  ...form, authToken, MrNO: patientCode, IPDCode: patientNo,  memberRole: form.memberRole ? Number(form.memberRole) : undefined, consultantcode: consultantCode, consultantname: username ?? undefined, Starttime: formatTime(form.Starttime), EndTime: formatTime(form.EndTime) });
      onSuccess();
    } catch (_) {}
  };

  const isValid = form.Otdate && form.Op_Executed;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none overflow-hidden">
      <div className="h-0.5 w-full bg-gradient-to-r from-rose-500 via-pink-400 to-rose-400" />

      {/* Form header */}
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30">
          <Plus className="w-4 h-4 text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">New Operation Record</h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">MR No: {MrNO}</p>
        </div>
      </div>

      <div className="p-5 space-y-3">

        {/* ── 1. BASIC INFO ── */}
        <Accordion icon={<Hash className="w-4 h-4" />} title="Basic Information" color="emerald" open={openSections.basic} onToggle={() => toggle("basic")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="IPD Code" required>
              <input type="text" placeholder="IPD Code" value={patientNo} readOnly className={inputCls} />
            </Field>
            <Field label="OT Date" required>
              <input type="date" value={form.Otdate} onChange={set("Otdate")} className={inputCls} />
            </Field>
            <Field label="Start Time">
              <input type="time" value={form.Starttime} onChange={set("Starttime")} className={inputCls} />
            </Field>
            <Field label="End Time">
              <input type="time" value={form.EndTime} onChange={set("EndTime")} className={inputCls} />
            </Field>
            <Field label="Skin Incision Time">
              <input type="text" placeholder="e.g. 09:15 AM" value={form.SkinIncisionTime} onChange={set("SkinIncisionTime")} className={inputCls} />
            </Field>
            <Field label="Skin Closure Time">
              <input type="text" placeholder="e.g. 11:30 AM" value={form.SkinClosureTime} onChange={set("SkinClosureTime")} className={inputCls} />
            </Field>
          </div>
        </Accordion>

        {/* ── 2. DIAGNOSIS ── */}
        <Accordion icon={<Stethoscope className="w-4 h-4" />} title="Diagnosis" color="blue" open={openSections.diagnosis} onToggle={() => toggle("diagnosis")}>
          <Field label="Pre-Operative Diagnosis">
            <textarea rows={2} placeholder="Diagnosis before surgery…" value={form.PreOPDiagnosis} onChange={set("PreOPDiagnosis")} className={textareaCls} />
          </Field>
          <Field label="Post-Operative Diagnosis">
            <textarea rows={2} placeholder="Diagnosis after surgery…" value={form.PostOpDiagnosis} onChange={set("PostOpDiagnosis")} className={textareaCls} />
          </Field>
          <Field label="Operation Notes / Diagnosis">
            <textarea rows={4} placeholder="Detailed intraoperative findings and notes…" value={form.Diagnosis} onChange={set("Diagnosis")} className={textareaCls} />
          </Field>
        </Accordion>

        {/* ── 3. SURGERY DETAILS ── */}
        <Accordion icon={<Layers className="w-4 h-4" />} title="Surgery Details" color="violet" open={openSections.surgery} onToggle={() => toggle("surgery")}>
          <Field label="Operation Proposed" required>
            <textarea rows={2} placeholder="Planned operation…" value={form.Op_Preposed} onChange={set("Op_Preposed")} className={textareaCls} />
          </Field>
          <Field label="Operation Executed" required>
            <textarea rows={2} placeholder="Operation actually performed…" value={form.Op_Executed} onChange={set("Op_Executed")} className={textareaCls} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Surgery">
              <input type="text" placeholder="Surgery name…" value={form.Surgery} onChange={set("Surgery")} className={inputCls} />
            </Field>
            <Field label="Member Role" required>
              <select value={form.memberRole} onChange={set("memberRole")} className={inputCls}>
                <option value="">Select Role</option>
                {otGroups.map(g => (
                  <option key={g.Unkid} value={g.Unkid}>
                    {g.Alias}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Surgery Group">
              <select value={form.SurgeryGroup} onChange={set("SurgeryGroup")} className={inputCls}>
                <option value="">Select Surgery Group</option>
                {surgeryGroups.map(s => (
                  <option key={s.ServiceCode} value={s.ServiceCode}>
                    {s.ServiceName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Anaesthesia Group">
            <select value={form.anesthesiaGroup} onChange={set("anesthesiaGroup")} className={inputCls}>
              <option value="">Select Anaesthesia Group</option>
              {anesthesiaGroups.map(a => (
                <option key={a.ServiceCode} value={a.ServiceCode}>
                  {a.ServiceName}
                </option>
              ))}
            </select>
          </Field>
          </div>
        </Accordion>

        {/* ── 4. OT PROCEDURE ── */}
        <Accordion icon={<ClipboardList className="w-4 h-4" />} title="OT Procedure" color="rose" open={openSections.procedure} onToggle={() => toggle("procedure")}>
          <Field label="OT Procedure" hint="Step-by-step operative procedure description">
            <textarea rows={6} placeholder="Describe the operative procedure in detail…" value={form.OTProcedure} onChange={set("OTProcedure")} className={textareaCls} />
          </Field>
        </Accordion>

        {/* ── 5. INTRAOPERATIVE DETAILS ── */}
        <Accordion icon={<Activity className="w-4 h-4" />} title="Intraoperative Details" color="amber" open={openSections.intraop} onToggle={() => toggle("intraop")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Blood Loss">
              <input type="text" placeholder="e.g. ~200 mL" value={form.BloodLoss} onChange={set("BloodLoss")} className={inputCls} />
            </Field>
            <Field label="Counts">
              <input type="text" placeholder="Swab / instrument counts correct" value={form.Counts} onChange={set("Counts")} className={inputCls} />
            </Field>
            <Field label="II Usage (Image Intensifier)">
              <input type="text" placeholder="e.g. Used / Not Used" value={form.IIUsage} onChange={set("IIUsage")} className={inputCls} />
            </Field>
          </div>
          <Field label="Closure">
            <textarea rows={2} placeholder="Wound closure technique…" value={form.Closure} onChange={set("Closure")} className={textareaCls} />
          </Field>
        </Accordion>

        {/* ── 6. SPECIMENS & IMPLANT ── */}
        <Accordion icon={<FlaskConical className="w-4 h-4" />} title="Specimens & Implant" color="teal" open={openSections.specimens} onToggle={() => toggle("specimens")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Culture & Sensitivity">
              <textarea rows={2} value={form.CultureSensitivity} onChange={set("CultureSensitivity")} className={textareaCls} />
            </Field>
            <Field label="Biopsy">
              <textarea rows={2} value={form.BIOPSY} onChange={set("BIOPSY")} className={textareaCls} />
            </Field>
            <Field label="Histopathology">
              <textarea rows={2} value={form.Histopathology} onChange={set("Histopathology")} className={textareaCls} />
            </Field>
            <Field label="Implant">
              <textarea rows={2} placeholder="Implant used if any…" value={form.IMPLANT} onChange={set("IMPLANT")} className={textareaCls} />
            </Field>
          </div>
        </Accordion>

        {/* ── 7. REMARKS ── */}
        <Accordion icon={<BadgeInfo className="w-4 h-4" />} title="Remarks" color="violet" open={openSections.remarks} onToggle={() => toggle("remarks")}>
          <Field label="Remarks">
            <textarea rows={3} placeholder="Any additional remarks…" value={form.REMARKS} onChange={set("REMARKS")} className={textareaCls} />
          </Field>
        </Accordion>

        {/* ── Error ── */}
        {isError && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Failed to save operation record. Please try again.
          </div>
        )}

        {/* ── Submit ── */}
        <div className="flex items-center justify-end pt-2">
          <button
            onClick={handleSubmit}
            disabled={isPending || !isValid}
            className="
              inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
              text-xs font-bold text-white
              bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-150
            "
          >
            {isPending
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
              : <><CheckCircle2 className="w-3.5 h-3.5" /> Save Operation Record</>
            }
          </button>
        </div>

      </div>
    </div>
  );
};

const inputCls = `
  w-full px-3 py-2 rounded-lg text-xs
  bg-slate-50 dark:bg-slate-800/60
  border border-slate-200 dark:border-slate-700/60
  text-slate-800 dark:text-slate-100
  placeholder:text-slate-300 dark:placeholder:text-slate-600
  focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400
  dark:focus:ring-rose-500/30 dark:focus:border-rose-500
  transition-colors
`;

const textareaCls = `${inputCls} resize-none`;

export default IPDOperationRecord;