"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Users,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  Check,
  RefreshCw,
  Download,
  FileText,
  User,
  Phone,
  MapPin,
  Clock,
  ChevronRight,
  X,
  Building2,
  Stethoscope,
  ArrowLeft,
  SlidersHorizontal,
  ChevronUp,
} from "lucide-react";
import { useAuthToken } from "@/context/AuthContext";
import { useOPDPatients } from "@/queries/opd.queries";
import { useRouter } from "next/navigation";
import { useFacultyMaster } from "@/queries/master.queries";
import { opdPatientRequest } from "@/types/patient.type";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { RotatingLines } from "react-loader-spinner";
import { AutoSizer, List } from "react-virtualized";

const DATE_OPTIONS = [
  "Today",
  "Yesterday",
  "This Week",
  "Previous Week",
  "This Month",
  "Previous Month",
  "Custom",
];

interface OPDALLPatientsProps {
  onClose: () => void;
}

const OPDALLPatients: React.FC = () => {
  const { authToken } = useAuthToken();
  const router = useRouter();

   const STORAGE_KEY = "opd_filters_state";

  const loadState = () => {
    try{
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch(e) {
      return null;
    }
  }

  const saveState = (state: object) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  const saved = loadState();
  // Filter States
  const [dateFilter, setDateFilter] = useState(saved?.dateFilter ?? "Today");
  const [dateOpen, setDateOpen] = useState(false);
  const [customDate, setCustomDate] = useState(saved?.customDate ?? { from: "", to: "" });
  const dateRef = useRef<HTMLDivElement | null>(null);

  const [selectedFaculty, setSelectedFaculty] = useState(saved?.selectedFaculty ?? "");
  const [facultyOpen, setFacultyOpen] = useState(false);
  const facultyRef = useRef<HTMLDivElement | null>(null);

  const [searchName, setSearchName] = useState(saved?.searchName ?? "");
  const [searchMRNo, setSearchMRNo] = useState(saved?.searchMRNo ?? "");
  const [showFilters, setShowFilters] = useState(false); // collapsed by default

  const { data: facultyMaster, isLoading: isFacultyLoading } = useFacultyMaster(authToken);

  const [filters, setFilters] = useState<opdPatientRequest>(
    saved?.filters ?? {  deptcode: 0,  centerid: 1,  showall: "1",  date: null,  datefrom: null,   dateTo: null,  PATIENTNAME: "",  MRNO: "",
  });

  const Loader = () => (
    <RotatingLines
      strokeColor="#3b82f6"
      strokeWidth="5"
      animationDuration="0.75"
      width="48"
      visible={true}
    />
  );
 
  useEffect(() => {
    const referer = sessionStorage.getItem("opd_referer");
    if(referer !== "consultant-notes") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    sessionStorage.removeItem("opd_referer");
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dateRef.current?.contains(e.target as Node)) setDateOpen(false);
      if (!facultyRef.current?.contains(e.target as Node)) setFacultyOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getDateRange = () => {
    const today = new Date();
    let fromDate = "";
    let toDate = "";

    switch (dateFilter) {
      case "Today":
        fromDate = toDate = today.toISOString().split("T")[0];
        break;
      case "Yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        fromDate = toDate = yesterday.toISOString().split("T")[0];
        break;
      case "This Week":
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        fromDate = startOfWeek.toISOString().split("T")[0];
        toDate = today.toISOString().split("T")[0];
        break;
      case "Previous Week":
        const prevWeekEnd = new Date(today);
        prevWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        const prevWeekStart = new Date(prevWeekEnd);
        prevWeekStart.setDate(prevWeekEnd.getDate() - 6);
        fromDate = prevWeekStart.toISOString().split("T")[0];
        toDate = prevWeekEnd.toISOString().split("T")[0];
        break;
      case "This Month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        fromDate = startOfMonth.toISOString().split("T")[0];
        toDate = today.toISOString().split("T")[0];
        break;
      case "Previous Month":
        const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        fromDate = prevMonthStart.toISOString().split("T")[0];
        toDate = prevMonthEnd.toISOString().split("T")[0];
        break;
      case "Custom":
        fromDate = customDate.from;
        toDate = customDate.to;
        break;
      default:
        fromDate = toDate = today.toISOString().split("T")[0];
    }

    return { fromDate, toDate };
  };

  const { fromDate, toDate } = getDateRange();

  const { data: patients = [], isLoading } = useOPDPatients(authToken, filters);

  const handleSearch = () => {
    if (!authToken) return;
    const newFIlters = {
      deptcode: selectedFaculty ? parseInt(selectedFaculty) : 0,
      centerid: 1,
      showall: selectedFaculty ? "1" : "0",
      date: null,
      datefrom: fromDate || null,
      dateTo: toDate || null,
      PATIENTNAME: searchName,
      MRNO: searchMRNo,
    };
    setFilters(newFIlters);
    setShowFilters(false);

    saveState({ dateFilter, customDate, selectedFaculty, searchName, searchMRNo, filters: newFIlters });
  };

  const handleClearFilters = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setSearchName("");
    setSearchMRNo("");
    setDateFilter("Today");
    setCustomDate({ from: "", to: "" });
    setSelectedFaculty("");
    setFilters({
      deptcode: 0,
      centerid: 1,
      showall: "1",
      date: "",
      datefrom: "",
      dateTo: "",
      PATIENTNAME: "",
      MRNO: "",
    });
  };

  const openConsultantNotes = (Patient: any) => {
    sessionStorage.setItem("opd_referer", "consultant-notes");
    sessionStorage.setItem("selectedPatient", JSON.stringify(Patient));
    router.push(`/consultant-notes/${Patient.PatientCode}`);
  };

  const gridClass =
    "grid w-full grid-cols-1 md:grid-cols-[0.8fr_1.2fr_1.5fr_1.8fr_2fr_1.3fr] items-center";

  const rowRenderer = ({ rowData, index, key, style }: any) => {
    const patient = patients[index];
    if (!patient) return null;

    return (
      <div
        key={key}
        style={style}
        className={`${gridClass} border-b border-slate-100 hover:bg-blue-50/60 dark:hover:bg-slate-700/40 transition-colors text-left text-sm group cursor-pointer`}
        onClick={() => openConsultantNotes(rowData)}
      >
        {/* Actions */}
        <div className="flex items-start gap-0.5 px-1">
          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition">
            <FileText className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* IPD / MR */}
        <div className="px-3 md:px-4 py-3 whitespace-nowrap">
          <p className="font-mono text-sm md:text-xs font-semibold text-slate-700 dark:text-slate-200">
            {patient.RegCode || "N/A"}
          </p>
          <p className="font-mono text-sm md:text-xs text-slate-400">{patient.PatientCode}</p>
        </div>

        {/* Patient info */}
        <div className="px-3">
          <p className="font-mono text-sm md:text-sm font-semibold text-slate-700 dark:text-slate-200">
            {patient.PATIENTNAME}
          </p>
          <p className="font-mono text-sm md:text-xs text-slate-400">{patient.Age}</p>
        </div>

        {/* Contact */}
        <div className="px-3 flex flex-col gap-0.5 truncate">
          <span className="flex gap-1 items-start text-sm md:text-xs text-slate-700 dark:text-slate-300">
            <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {patient.Mobile || "N/A"}
          </span>
          <span className="flex gap-1 items-start text-sm md:text-xs text-slate-500 truncate">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {patient.ADDRESS || "N/A"}
          </span>
        </div>

        {/* Consultant */}
        <div className="px-3 flex gap-1 items-start text-sm md:text-xs text-slate-700 dark:text-slate-300 truncate">
          <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{patient.BlockedBy || "N/A"}</span>
        </div>

        {/* Visit Mode */}
        <div className="px-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              patient.VisitMode?.toLowerCase().includes("new")
                ? "bg-emerald-100 text-emerald-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {patient.VisitMode}
          </span>
        </div>
      </div>
    );
  };

  const getSelectedFacultyLabel = () => {
    if (!facultyMaster || facultyMaster.length === 0) return "All Faculties";
    const faculty = facultyMaster.find(
      (f: any) => f.Code.toString() === selectedFaculty
    );
    return faculty?.label || "All Faculties";
  };

  const stats = {
    total: patients.length,
    newVisits: patients.filter((p: any) => p.VisitMode?.includes("New")).length,
    followUps: patients.filter((p: any) => p.VisitMode?.includes("Follow Up")).length,
  };

  const hasActiveFilters =
    searchName || searchMRNo || selectedFaculty || dateFilter !== "Today";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader />
          <p className="text-slate-500 text-sm font-medium">Loading patients…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-full bg-slate-50 dark:bg-slate-900">
      {/* ── Top Header Bar ── */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="px-6 py-3 flex items-center justify-between gap-4">

          {/* Left: Back + Title */}
          <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-all"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="lg:text-xl md:text-sm font-bold text-slate-800 dark:text-white leading-none">
                  OPD Patients
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Outpatient Department Records
                </p>
              </div>
            </div>
          </div>

          {/* Right: Stats pills + Search Filter toggle */}
          <div className="flex items-center gap-3">
            {/* Quick stat pills */}
            <div className="hidden md:flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                <Users className="w-3 h-3" /> {stats.total} Total
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold">
                <User className="w-3 h-3" /> {stats.newVisits} New
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                <RefreshCw className="w-3 h-3" /> {stats.followUps} Follow-up
              </span>
            </div>

            {/* Search Filter toggle button */}
            <button
              onClick={() => setShowFilters((p) => !p)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm border ${
                showFilters
                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                  : hasActiveFilters
                  ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Search Filter
              {hasActiveFilters && !showFilters && (
                <span className="w-2 h-2 rounded-full bg-amber-500 ml-0.5" />
              )}
              {showFilters ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* ── Collapsible Filter Panel ── 
            NOTE: No overflow-hidden here — that clips absolute dropdowns.
            We use display:none / block toggling instead for the panel. */}
        {showFilters && (
          <div className="px-6 pb-5 pt-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">

            {/* Row 1: Faculty + Search inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

              {/* Faculty Dropdown — overflow:visible so menu isn't clipped */}
              <div ref={facultyRef} className="relative">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  Department / Faculty
                </label>
                <button
                  onClick={() => setFacultyOpen((p) => !p)}
                  className="flex items-center justify-between w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl hover:border-blue-400 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                      {getSelectedFacultyLabel()}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${facultyOpen ? "rotate-180" : ""}`} />
                </button>

                {facultyOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl p-1.5 z-[100] max-h-64 overflow-y-auto">
                    <button
                      onClick={() => { setSelectedFaculty(""); setFacultyOpen(false); }}
                      className="flex w-full justify-between items-center px-3 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="text-slate-600 dark:text-slate-300">All Faculties</span>
                      {!selectedFaculty && <Check className="w-4 h-4 text-blue-500" />}
                    </button>
                    {facultyMaster?.map((faculty: any) => (
                      <button
                        key={faculty.Code}
                        onClick={() => { setSelectedFaculty(faculty.Code.toString()); setFacultyOpen(false); }}
                        className="flex w-full justify-between items-center px-3 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <span className="text-slate-700 dark:text-slate-200">{faculty.label}</span>
                        {selectedFaculty === faculty.Code.toString() && <Check className="w-4 h-4 text-blue-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Patient name search */}
              <div className="relative">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  Patient Name
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name…"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* MR number search */}
              <div className="relative">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  MR Number
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by MR No…"
                    value={searchMRNo}
                    onChange={(e) => setSearchMRNo(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Date range — all options visible as inline chips */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Date Range
              </label>
              <div className="flex flex-wrap gap-2">
                {DATE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setDateFilter(opt)}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      dateFilter === opt
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-400 hover:text-blue-600"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom date pickers — only shown when Custom is selected */}
            {dateFilter === "Custom" && (
              <div className="mb-5 grid grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                <div>
                  <label className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1.5 block">
                    From Date
                  </label>
                  <DatePicker
                    selected={customDate.from ? new Date(customDate.from) : null}
                    onChange={(date: any) =>
                      setCustomDate((prev: any) => ({
                        ...prev,
                        from: date ? date.toISOString().split("T")[0] : "",
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-blue-200 dark:border-slate-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select start date"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1.5 block">
                    To Date
                  </label>
                  <DatePicker
                    selected={customDate.to ? new Date(customDate.to) : null}
                    onChange={(date: any) =>
                      setCustomDate((prev: any) => ({
                        ...prev,
                        to: date ? date.toISOString().split("T")[0] : "",
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-blue-200 dark:border-slate-600 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select end date"
                  />
                </div>
              </div>
            )}

            {/* Row 3: Action buttons */}
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
              >
                <X className="w-4 h-4" /> Clear
              </button>
              <button
                onClick={handleSearch}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm"
              >
                <Search className="w-4 h-4" /> Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Content ── */}
      <div className="px-6 py-5">

        {/* Stats cards (visible on mobile since pills are hidden) */}
        <div className="grid grid-cols-3 gap-4 mb-5 md:hidden">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">Total</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">New Visits</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.newVisits}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">Follow-ups</p>
            <p className="text-2xl font-bold text-purple-600">{stats.followUps}</p>
          </div>
        </div>

        {/* ── Virtualized Table ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          {/* Sticky table header */}
          <div
            className={`${gridClass} bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-semibold uppercase tracking-wide`}
          >
            <div className="px-2 py-3.5">Action</div>
            <div className="px-3 py-3.5">MR No</div>
            <div className="px-3 py-3.5">Patient Info</div>
            <div className="px-3 py-3.5">Contact</div>
            <div className="px-3 py-3.5">Blocked By</div>
            <div className="px-3 py-3.5">Visit Mode</div>
          </div>

          {patients.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7 text-slate-300 dark:text-slate-500" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">
                No patients found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting the date range or filters
              </p>
              <button
                onClick={() => setShowFilters(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Open Filters
              </button>
            </div>
          ) : (
            <div style={{ height: 600 }}>
              <AutoSizer>
                {({ width, height }) => (
                  <List
                    width={width}
                    height={height}
                    headerHeight={0}
                    rowHeight={72}
                    rowCount={patients.length}
                    overscanRowCount={5}
                    rowRenderer={({ index, key, style }) =>
                      rowRenderer({ rowData: patients[index], index, key, style })
                    }
                  />
                )}
              </AutoSizer>
            </div>
          )}

          {/* Table footer */}
          {patients.length > 0 && (
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {patients.length}
                </span>{" "}
                patients found
                {hasActiveFilters && (
                  <span className="ml-2 text-amber-600 font-medium">• Filtered</span>
                )}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Updated {new Date().toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OPDALLPatients;