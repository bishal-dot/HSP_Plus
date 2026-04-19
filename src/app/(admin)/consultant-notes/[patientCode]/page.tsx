"use client";

import ConsultantNotesForm from "@/app/(admin)/consultant-notes/[patientCode]/components/ConsultantNotes";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useAuthToken } from "@/context/AuthContext";
import {
  ArrowRightLeft, ClipboardList, FileText, FlaskConical,
  LogOut, NotebookIcon, Phone, Pill, ReceiptIcon,
  ReceiptText, Scan, Stethoscope, User, ChevronLeft,
  Hash, Calendar, Building2, UserRound, Syringe,
  ChevronsUpDown, Search, X, ChevronDown, Users,
} from "lucide-react";
import SsdReferToPatientPage from "@/app/(admin)/ssd-estimate/components/SsdReferToPatientPage";
import ENTConsultantNotesForm from "./components/ENTNewConsultantNotes";
import { RotatingLines } from "react-loader-spinner";
import { useConsultant } from "@/context/ConsultantContext";
import { useOPDPatientsDayWise } from "@/queries/opd.queries";
import { useIPDPatients } from "@/queries/ipd.queries";

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

function PatientSwitcher({
  patientType,
  currentPatientId,
  authToken,
  consultantCode,
  deptCode,
}: {
  patientType: "opd" | "ipd" | null;
  currentPatientId: string | undefined;
  authToken: string | null;
  consultantCode: number;
  deptCode: number | null | undefined;
}) {
  const router = useRouter();
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const panelRef          = useRef<HTMLDivElement>(null);
  const inputRef          = useRef<HTMLInputElement>(null);

  /* ── today for OPD ── */
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "-"); // "YYYY-MM-DD"

  /* ── OPD patients ── */
  const { data: opdData, isLoading: opdLoading } = useOPDPatientsDayWise(
    authToken,
    {
      DTODAY:         "2026-01-19",
      deptcode:       deptCode   ?? 0,
      consultantcode: consultantCode,
      centerid:       1,
    },
    // { enabled: patientType === "opd" && open }
  );
  /* ── IPD patients ── */
  const { data: ipdData, isFetching: ipdLoading } = useIPDPatients(
    authToken,
    { centerCode: "", search: query },
  );

  const rawList: any[] =
    patientType === "opd" ? (opdData?.data ?? []) :
    patientType === "ipd" ? (ipdData?.data ?? [])  : [];

  /* ── client-side filter for OPD (IPD already server-filtered) ── */
  const filtered = patientType === "opd" && query.trim()
    ? rawList.filter((p) => {
        const name = (p.PatientName || p.PATIENTNAME || p.patientname || "").toLowerCase();
        const mr   = (p.MRNo        || p.PatientCode || p.Mrno        || "").toLowerCase();
        const tok  = (p.TokenNo     || "").toLowerCase();
        const q    = query.toLowerCase();
        return name.includes(q) || mr.includes(q) || tok.includes(q);
      })
    : rawList;

  /* ── close on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── focus input when opened ── */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  /* ── navigate to selected patient ── */
  const handleSelect = (patient: any) => {
    sessionStorage.setItem("selectedPatient", JSON.stringify(patient));
    const code =
      patient.MRNo        ||
      patient.PatientCode ||
      patient.Mrno        ||
      "";
    router.push(`/consultant-notes/${code}`);
    setOpen(false);
    setQuery("");
  };

  const getLabel = (p: any) =>
    p.PatientName || p.PATIENTNAME || p.patientname || "Unknown";
  const getMr = (p: any) =>
    p.MRNo || p.PatientCode || p.Mrno || "—";
  const getSecondary = (p: any) =>
    p.TokenNo || p.IPDCODE || p.wardName || p.FacultyName || "";

  const isLoading = patientType === "opd" ? opdLoading : ipdLoading;
  const isCurrent = (p: any) => getMr(p) === currentPatientId;

  if (!patientType) return null;

  return (
    <div ref={panelRef} className="relative">
      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
          border transition-all duration-150
          ${open
            ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/40"
            : `border-gray-200 dark:border-gray-700
               bg-white dark:bg-gray-800/60
               text-gray-600 dark:text-gray-300
               hover:bg-gray-50 dark:hover:bg-gray-800
               hover:border-gray-300 dark:hover:border-gray-600
               hover:text-gray-900 dark:hover:text-white`
          }
        `}
      >
        <Users className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Search Patients</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="
          absolute right-0 top-full mt-2 z-50
          w-80 sm:w-96
          rounded-2xl border border-gray-200 dark:border-gray-700
          bg-white dark:bg-gray-900
          shadow-xl shadow-gray-200/60 dark:shadow-black/40
          overflow-hidden
          animate-in fade-in slide-in-from-top-2 duration-150
        ">
          {/* Search bar */}
          <div className="p-3 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={patientType === "ipd" ? "Search IPD patients…" : "Search today's OPD patients…"}
                className="
                  w-full pl-8 pr-8 py-2 text-sm rounded-lg
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  text-gray-800 dark:text-gray-100
                  placeholder:text-gray-400 dark:placeholder:text-gray-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
                  transition-all
                "
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Patient list */}
          <div className="max-h-72 overflow-y-auto overscroll-contain">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RotatingLines strokeColor="gray" strokeWidth="4" animationDuration="0.75" width="28" visible />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                {query ? "No patients match your search" : "No patients found"}
              </div>
            ) : (
              filtered.map((p, i) => {
                const active = isCurrent(p);
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(p)}
                    className={`
                      w-full text-left px-4 py-2.5
                      flex items-center gap-3
                      transition-colors duration-100
                      ${active
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/60"}
                      border-b border-gray-100 dark:border-gray-800/60 last:border-0
                    `}
                  >
                    {/* Avatar circle */}
                    <div className={`
                      w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold
                      ${active
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}
                    `}>
                      {getLabel(p).charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`
                        text-sm font-semibold truncate leading-tight
                        ${active ? "text-blue-700 dark:text-blue-400" : "text-gray-800 dark:text-gray-100"}
                      `}>
                        {getLabel(p)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                        MR: {getMr(p)}
                        {getSecondary(p) ? ` · ${getSecondary(p)}` : ""}
                      </p>
                    </div>

                    {/* "Current" pill */}
                    {active && (
                      <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                        Current
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer count */}
          {!isLoading && filtered.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30">
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                {filtered.length} {patientType === "ipd" ? "IPD" : "OPD"} patient{filtered.length !== 1 ? "s" : ""}
                {patientType === "opd" ? " today" : ""}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────────── */
export default function ConsultantNotesPage() {
  const PreviousConsultantNotes   = dynamic(() => import("./components/ConsultantNotesHistory"),   { loading: () => <Loader /> });
  const PrescriptionForm          = dynamic(() => import("./components/PrescriptionForm"),          { loading: () => <Loader /> });
  const LaboratoryRecords         = dynamic(() => import("./components/LaboratoryRecords"),         { loading: () => <Loader /> });
  const ImagingRecords            = dynamic(() => import("./components/ImagingRecords"),            { loading: () => <Loader /> });
  const PatientClinicalRecordPage = dynamic(() => import("./components/PatientCase"),              { loading: () => <Loader /> });
  const ServiceComponent          = dynamic(() => import("./components/ServiceNotes"),              { loading: () => <Loader /> });
  const ProgressNotePage          = dynamic(() => import("./components/ProgressNote"),             { loading: () => <Loader /> });
  const BillDetailsPage           = dynamic(() => import("./components/BillDetails"),              { loading: () => <Loader /> });
  const IPDOperationRecords       = dynamic(() => import("./components/IPDOperationRecords"),      { loading: () => <Loader /> });
  const IPDDischargeSummary       = dynamic(() => import("./components/DischargeSummary"),         { loading: () => <Loader /> });

  const { patientCode } = useParams<{ patientCode: string }>();
  const { authToken, consultantCode }   = useAuthToken();
  const router  = useRouter();

  
  const [deptCode, setDeptCode] = useState<number | null>(null);
  const [activeTab,   setActiveTab]   = useState<TabKey | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [patientInfo, setPatientInfo] = useState<any>(null);

   useEffect(() => {
      if(!consultantCode) return;
  
      const fetchDeptCode = async () => {
        const res = await fetch(`/api/masters/consultant/${consultantCode}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          cache: 'no-cache',
        });
        const result = await res.json();
        console.log("Faculty Master", result?.FacultyCode);
        setDeptCode(result?.FacultyCode);
      };
  
      fetchDeptCode();
    }, [consultantCode])

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedPatient");
    if (stored) setPatientInfo(JSON.parse(stored));
  }, [patientCode]); // re-read when route patientCode changes (switcher navigation)

  const patientId   = patientInfo?.MRNo || patientInfo?.PatientCode || patientInfo?.Mrno;
  const patientNo   = patientInfo?.RegNo || patientInfo?.IPDCODE || patientInfo?.RegCode;
  const patientType = patientInfo ? (patientInfo.IPDCODE ? "ipd" : "opd") : null;
  const isENT       = patientInfo?.TokenNo?.toLowerCase().includes("ent") ||
                      patientInfo?.wardName === "Ear Ward" ||
                      patientInfo?.WARD     === "Ear Ward";

  // Reset active tab when patient changes
  useEffect(() => {
    setActiveTab(null);
    setShowHistory(false);
  }, [patientCode]);

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
    { key: "consultant-notes", label: "Notes",       icon: <FileText      className="w-3.5 h-3.5" /> },
    { key: "prescription",     label: "Prescription",icon: <Pill          className="w-3.5 h-3.5" /> },
    { key: "services",         label: "Services",    icon: <Stethoscope   className="w-3.5 h-3.5" /> },
    { key: "imaging",          label: "Imaging",     icon: <Scan          className="w-3.5 h-3.5" /> },
    { key: "laboratory",       label: "Lab",         icon: <FlaskConical  className="w-3.5 h-3.5" /> },
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
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-50">
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

        {/* ── Patient switcher (pushed to the right) ── */}
        <div className="ml-auto">
          <PatientSwitcher
            patientType={patientType}
            currentPatientId={patientId}
            authToken={authToken}
            consultantCode={consultantCode}
            deptCode={deptCode}
          />
        </div>
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

        {activeTab === "prescription"      && patientId && <PrescriptionForm          patientCode={patientId} />}
        {activeTab === "services"          && patientId && <ServiceComponent          Patientcode={patientId} />}
        {activeTab === "imaging"           && patientId && <ImagingRecords            Patientcode={patientId} />}
        {activeTab === "laboratory"        && patientId && <LaboratoryRecords         Patientcode={patientId} />}
        {activeTab === "patient-case"      && patientId && <PatientClinicalRecordPage Patientcode={patientId} />}
        {activeTab === "progress-note"     && patientId && <ProgressNotePage          PatientCode={patientId} />}
        {activeTab === "bill-details"      && patientId && <BillDetailsPage           PatientCode={patientNo} />}
        {activeTab === "operation-records" && patientId && <IPDOperationRecords       PatientCode={patientId} />}
        {activeTab === "discharge-summary" && patientId && <IPDDischargeSummary       MrNO={patientId}        />}
        {activeTab === "referssd"          && patientId && <SsdReferToPatientPage     patientInfo={patientInfo} />}
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