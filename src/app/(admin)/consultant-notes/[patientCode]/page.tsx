"use client";

import ConsultantNotesForm from "@/app/(admin)/consultant-notes/[patientCode]/components/ConsultantNotes";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useAuthToken } from "@/context/AuthContext";
import {
  ArrowRightLeft, ClipboardList, FileText, FlaskConical,
  LogOut, NotebookIcon, Phone, Pill, ReceiptIcon,
  ReceiptText, Scan, Stethoscope, User, ChevronLeft,
  Hash, Calendar, Building2, UserRound, Syringe,
} from "lucide-react";
import SsdReferToPatientPage from "@/app/(admin)/ssd-estimate/components/SsdReferToPatientPage";
import ENTConsultantNotesForm from "./components/ENTNewConsultantNotes";
import { RotatingLines } from "react-loader-spinner";

type TabKey =
  | "consultant-notes" | "prescription" | "imaging"
  | "laboratory" | "patient-case" | "services"
  | "referssd" | "progress-note" | "bill-details"
  | "operation-records" | "discharge-summary";

const Loader = () => (
  <div className="flex items-center justify-center mt-24">
    <RotatingLines strokeColor="gray" strokeWidth="4" animationDuration="0.75" width="40" visible />
  </div>
);

export default function ConsultantNotesPage() {
  const PreviousConsultantNotes = dynamic(() => import("./components/ConsultantNotesHistory"), { loading: () => <Loader /> });
  const PrescriptionForm        = dynamic(() => import("./components/PrescriptionForm"),        { loading: () => <Loader /> });
  const LaboratoryRecords       = dynamic(() => import("./components/LaboratoryRecords"),       { loading: () => <Loader /> });
  const ImagingRecords          = dynamic(() => import("./components/ImagingRecords"),          { loading: () => <Loader /> });
  const PatientClinicalRecordPage = dynamic(() => import("./components/PatientCase"),           { loading: () => <Loader /> });
  const ServiceComponent        = dynamic(() => import("./components/ServiceNotes"),            { loading: () => <Loader /> });
  const ProgressNotePage        = dynamic(() => import("./components/ProgressNote"),            { loading: () => <Loader /> });
  const BillDetailsPage         = dynamic(() => import("./components/BillDetails"),             { loading: () => <Loader /> });
  const IPDOperationRecords     = dynamic(() => import("./components/IPDOperationRecords"),     { loading: () => <Loader /> });
  const IPDDischargeSummary     = dynamic(() => import("./components/DischargeSummary"),        { loading: () => <Loader /> });

  const { patientCode } = useParams<{ patientCode: string }>();
  const { authToken }   = useAuthToken();
  const router          = useRouter();

  const [activeTab,   setActiveTab]   = useState<TabKey | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [patientInfo, setPatientInfo] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedPatient");
    if (stored) setPatientInfo(JSON.parse(stored));
  }, []);

  const patientId   = patientInfo?.MRNo || patientInfo?.PatientCode || patientInfo?.Mrno;
  const patientNo   = patientInfo?.TokenNo || patientInfo?.IPDCODE;
  const patientType = patientInfo ? (patientInfo.IPDCODE ? "ipd" : "opd") : null;
  const isENT       = patientInfo?.FacultyName?.toLowerCase().includes("ent") ||
                      patientInfo?.wardName === "Ear Ward" ||
                      patientInfo?.WARD === "Ear Ward";

  const handleTabClick = (tab: TabKey) => {
    if (!patientId) return;
    if (tab !== "consultant-notes") setShowHistory(false);
    setActiveTab(tab);
  };

  const getPatientRegCode = (p: any) => {
    if ("TokenNo" in p && p.TokenNo) return p.TokenNo;
    if ("IPDCODE" in p && p.IPDCODE) return p.IPDCODE;
    if ("Mrno"    in p && p.Mrno)    return p.Mrno;
  };

  /* ── tab definitions ── */
  const opdTabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "consultant-notes", label: "Notes",       icon: <FileText     className="w-3.5 h-3.5" /> },
    { key: "prescription",     label: "Prescription",icon: <Pill         className="w-3.5 h-3.5" /> },
    { key: "services",         label: "Services",    icon: <Stethoscope  className="w-3.5 h-3.5" /> },
    { key: "imaging",          label: "Imaging",     icon: <Scan         className="w-3.5 h-3.5" /> },
    { key: "laboratory",       label: "Lab",         icon: <FlaskConical className="w-3.5 h-3.5" /> },
    { key: "patient-case",     label: "Case",        icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { key: "referssd",         label: "Refer SSD",   icon: <ArrowRightLeft className="w-3.5 h-3.5" /> },
  ];

  const ipdTabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "consultant-notes",  label: "Notes",      icon: <FileText      className="w-3.5 h-3.5" /> },
    { key: "services",          label: "Services",   icon: <Stethoscope   className="w-3.5 h-3.5" /> },
    { key: "imaging",           label: "Imaging",    icon: <Scan          className="w-3.5 h-3.5" /> },
    { key: "laboratory",        label: "Lab",        icon: <FlaskConical  className="w-3.5 h-3.5" /> },
    { key: "progress-note",     label: "Progress",   icon: <NotebookIcon  className="w-3.5 h-3.5" /> },
    { key: "bill-details",      label: "Bill",       icon: <ReceiptText   className="w-3.5 h-3.5" /> },
    { key: "operation-records", label: "Operations", icon: <ReceiptIcon   className="w-3.5 h-3.5" /> },
    { key: "discharge-summary", label: "Discharge",  icon: <LogOut        className="w-3.5 h-3.5" /> },
    { key: "referssd",          label: "Refer SSD",  icon: <ArrowRightLeft className="w-3.5 h-3.5" /> },
  ];

  const tabs = patientType === "ipd" ? ipdTabs : opdTabs;

  return (
    <div className="min-h-screen px-4 md:px-6 pb-16 pt-4 dark:bg-gray-950">

      {/* ── Page header ── */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="
            inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
            border border-gray-200 dark:border-gray-700
            text-gray-500 dark:text-gray-400
            hover:bg-white dark:hover:bg-gray-800
            hover:text-blue-600 dark:hover:text-blue-400
            hover:border-blue-200 dark:hover:border-blue-700
            transition-all duration-150
          "
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <div className="w-1 h-6 rounded-full bg-blue-500" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-50 ">
            Consultant Notes
          </h1>
        </div>

        {patientType && (
          <span className={`
            ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest
            ${patientType === "ipd"
              ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}
          `}>
            {patientType}
          </span>
        )}
      </div>

      {/* ── Patient card ── */}
      <div className="
        rounded-2xl border border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-900
        shadow-sm shadow-gray-100 dark:shadow-none
        overflow-hidden mb-5
      ">
        {/* Coloured top stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400" />

        <div className="px-5 pt-4 pb-3 space-y-4">
          {/* Patient name + code row */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="
                w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/40
              ">
                <UserRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-800 dark:text-gray-50 leading-tight">
                  {patientInfo
                    ? patientInfo.PatientName || patientInfo.PATIENTNAME || patientInfo.patientname || "—"
                    : "Loading…"}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {patientInfo?.Age ? `${patientInfo.Age}` : ""}
                  {patientInfo?.FacultyName || patientInfo?.wardName
                    ? ` · ${patientInfo?.FacultyName || patientInfo?.wardName}`
                    : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Info chips */}
          <div className="flex flex-wrap gap-2">
            <InfoChip icon={<Hash className="w-3 h-3" />}          label="MR No"      value={patientId || "—"} />
            <InfoChip icon={<ClipboardList className="w-3 h-3" />} label="Token"      value={patientInfo?.TokenNo || patientInfo?.IPDCODE || "—"} />
            <InfoChip icon={<Building2 className="w-3 h-3" />}     label="Dept"       value={patientInfo?.FacultyName || patientInfo?.wardName || "—"} />
            <InfoChip icon={<Stethoscope className="w-3 h-3" />}   label="Consultant" value={patientInfo?.ConsultingDoctor || patientInfo?.BlockedBy || patientInfo?.CONSULTANT || "—"} />
            <InfoChip icon={<Phone className="w-3 h-3" />}         label="Phone"      value={patientInfo?.ContactNo || patientInfo?.Mobile || "—"} />
          </div>

          {/* ── Tabs ── */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-700/60">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  if (t.key === "referssd") {
                    if (!patientId) return;
                    const regCode = getPatientRegCode(patientInfo);
                    if (!regCode) return;
                    sessionStorage.setItem("selectedPatient", JSON.stringify(patientInfo));
                    router.push(`/ssd-estimate/${patientId}/${patientNo}`);
                    return;
                  }
                  handleTabClick(t.key);
                  if (t.key === "consultant-notes") setShowHistory(true);
                }}
                onDoubleClick={() => {
                  if (t.key === "consultant-notes") setShowHistory(false);
                }}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                  border transition-all duration-150
                  ${activeTab === t.key
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/40"
                    : `border-gray-200 dark:border-gray-700
                       text-gray-600 dark:text-gray-400
                       bg-white dark:bg-gray-800/50
                       hover:bg-gray-50 dark:hover:bg-gray-800
                       hover:border-gray-300 dark:hover:border-gray-600
                       hover:text-gray-800 dark:hover:text-gray-200`
                  }
                `}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content area ── */}
      <div>
        {!activeTab && patientId && (
          isENT
            ? <ENTConsultantNotesForm existingNotes={null} router={router} />
            : <ConsultantNotesForm    existingNotes={null} router={router} />
        )}

        {activeTab === "consultant-notes" && patientId && (
          showHistory
            ? <PreviousConsultantNotes patientCode={patientId} onCreateNew={() => setShowHistory(false)} />
            : isENT
              ? <ENTConsultantNotesForm existingNotes={null} router={router} />
              : <ConsultantNotesForm    existingNotes={null} router={router} />
        )}

        {activeTab === "prescription"      && patientId && <PrescriptionForm       patientCode={patientId} />}
        {activeTab === "services"          && patientId && <ServiceComponent       Patientcode={patientId} />}
        {activeTab === "imaging"           && patientId && <ImagingRecords         Patientcode={patientId} />}
        {activeTab === "laboratory"        && patientId && <LaboratoryRecords      Patientcode={patientId} />}
        {activeTab === "patient-case"      && patientId && <PatientClinicalRecordPage Patientcode={patientId} />}
        {activeTab === "progress-note"     && patientId && <ProgressNotePage       PatientCode={patientId} />}
        {activeTab === "bill-details"      && patientId && <BillDetailsPage        PatientCode={patientNo} />}
        {activeTab === "operation-records" && patientId && <IPDOperationRecords    PatientCode={patientId} />}
        {activeTab === "discharge-summary" && patientId && <IPDDischargeSummary    MrNO={patientId} />}
        {activeTab === "referssd"          && patientId && <SsdReferToPatientPage  patientInfo={patientInfo} />}
      </div>
    </div>
  );
}

/* ── InfoChip ── */
function InfoChip({
  icon, label, value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
      bg-gray-50 dark:bg-gray-800/60
      border border-gray-100 dark:border-gray-700/60
      text-xs
    ">
      <span className="text-gray-400 dark:text-gray-500">{icon}</span>
      <span className="text-gray-400 dark:text-gray-500">{label}:</span>
      <span className="font-semibold text-gray-700 dark:text-gray-200">{value}</span>
    </div>
  );
}