'use client';
import React, { useEffect, useState } from "react";
import {
  Calendar,
  Download,
  Bed,
  Phone,
  MapPin,
  Stethoscope,
  Clock,
  Search,
  FileText,
  ChevronRight,
  X,
  RefreshCw,
  Users,
  BarChart3,
  ArrowLeft,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuthToken } from "@/context/AuthContext";
import { useDischargedPatients } from "@/queries/discharged.queries";
import { dischargedPatientResponse } from "@/types/patient.type";
import { RotatingLines } from "react-loader-spinner";
import { useRouter } from "next/navigation";
import { AutoSizer, List } from 'react-virtualized';
import 'react-virtualized/styles.css';

interface DischargedPatientsProps {
  onClose: () => void;
}

const DischargedPatients: React.FC = () => {
  const { authToken } = useAuthToken();
  const router = useRouter();

  const Loader = () => (
    <RotatingLines
      strokeColor="#3b82f6"
      strokeWidth="5"
      animationDuration="0.75"
      width="48"
      visible={true}
    />
  );

  const [filters, setFilters] = useState({
    DTFROM: "",
    dtto: "",
    centercode: "1",
    patientname: "",
    mrno: ""
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setAppliedFilters(filters), 300);
    return () => clearTimeout(timeout);
  }, [filters]);

  const { data, isFetching } = useDischargedPatients(authToken, appliedFilters);
  const dischargedPatients = data?.data ?? [];

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    const reset = {
      DTFROM: "",
      dtto: "",
      centercode: "1",
      patientname: "",
      mrno: ""
    };
    setFilters(reset);
    setAppliedFilters(reset);
  };

  const openConsultantNotes = (Patient: any) => {
    sessionStorage.setItem('selectedPatient', JSON.stringify(Patient));
    router.push(`/consultant-notes/${Patient.Mrno}`);
  };

  const totalWards = new Set(dischargedPatients.map((item: dischargedPatientResponse) => item.WARD)).size;

  const avgStayDays = 
    data?.data.reduce((sum:any, item:any) => sum + item.STAYDAYS, 0) / data?.data.length; 
  const roundedStayDays = avgStayDays.toFixed(0);

  const gridClass = `
    grid w-full items-center
    grid-cols-1
    sm:grid-cols-[0.3fr_1fr_2fr] 
    md:grid-cols-[0.3fr_1fr_2fr_1.5fr_1.5fr] 
    lg:grid-cols-[0.2fr_1fr_1.5fr_1.8fr_2.5fr_1.5fr_1.4fr_1.4fr_0.8fr]
  `;
  const rowRenderer = ({ rowData, index, key, style }: any) => {
    const patient = dischargedPatients[index];
    if (!rowData) return null;

    return (
      <div
        key={key}
        style={style}
        className={`${gridClass} border-b border-slate-100 hover:bg-blue-50/60 dark:hover:bg-slate-700/40 transition-colors text-left text-sm group cursor-pointer`}
        onClick={() => openConsultantNotes(rowData)}
      >
        {/* Actions */}
        <div className="flex items-start gap-0.5 px-1">
          <button className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition">
            <FileText className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* IPD / MR */}
        <div className="px-3">
          <p className="text-sm md:text-xs font-semibold text-slate-700 dark:text-slate-200">
            IPD{patient.IPDCODE || "N/A"}
          </p>
          <p className="text-sm md:text-xs text-slate-400">{patient.Mrno}</p>
        </div>

        {/* Patient info */}
        <div className="px-3">
          <p className="font-semibold md:text-sm text-base text-slate-800 dark:text-white truncate">{patient.PATIENTNAME || "N/A"}</p>
          <p className="text-xs text-slate-500">{patient.Age || "N/A"} yrs</p>
        </div>

        {/* Contact */}
        <div className="hidden lg:flex px-3 flex-col gap-0.5">
          <span className="flex gap-1 items-start text-sm md:text-xs text-slate-700 dark:text-slate-300">
            <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {patient.Mobile || "N/A"}
          </span>
          <span className="flex gap-1 items-start text-xs text-slate-500 truncate">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {patient.ADDRESS || "N/A"}
          </span>
        </div>

        {/* Ward */}
        <div className="px-3 flex gap-1 items-start text-sm md:text-xs text-slate-700 dark:text-slate-300 truncate">
          <Bed className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{patient.WARD || "N/A"}</span>
        </div>

        {/* Consultant */}
        <div className="px-3 flex gap-1 items-start text-xs text-slate-700 dark:text-slate-300">
          <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{patient.CONSULTANT || "N/A"}</span>
        </div>

        {/* Admission date */}
        <div className="px-3 hidden lg:flex flex-col gap-0.5">
          <span className="flex gap-1 items-center text-xs text-slate-700 dark:text-slate-300">
            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
            {patient.ADMITTEDTIME_E || "N/A"}
          </span>
          <span className="text-xs text-slate-400 pl-4">{patient.ADMITTEDTIME_N || ""}</span>
        </div>

        {/* Discharge date */}
        <div className="px-3 hidden lg:flex flex-col gap-0.5">
          <span className="flex gap-1 items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <Calendar className="w-3 h-3 shrink-0" />
            {patient.DISCHARGEDATE_E || "N/A"}
          </span>
          <span className="text-xs text-slate-400 pl-4">{patient.DISCHARGEDATE_N || ""}</span>
        </div>

        {/* Stay days */}
        <div className="px-3 hidden lg:flex">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold">
            <Clock className="w-3 h-3" />
            {patient.STAYDAYS || "—"}d
          </span>
        </div>
      </div>
    );
  };

  const hasActiveFilters = !!(
    appliedFilters.DTFROM ||
    appliedFilters.dtto ||
    appliedFilters.patientname ||
    appliedFilters.mrno
  );

  return (
    <>
      {/* Loading overlay */}
      {isFetching && (
        <div className="fixed inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl text-center border border-slate-100 dark:border-slate-700">
            <Loader />
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">Loading patients…</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">

        {/* ── Sticky Top Header Bar ── */}
        <div className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="px-5 py-3 flex items-center justify-between gap-4">

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
                <div className="p-2 bg-purple-600 rounded-lg shadow-sm">
                  <Bed className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-lg font-bold text-slate-800 dark:text-white leading-none">
                    Discharged Patients
                  </h1>
                  <p className="text-sm md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Inpatient discharge records
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Stat pills + Filter toggle + Export */}
            <div className="flex items-center gap-3">

              {/* Quick stat pills (desktop) */}
              <div className="hidden md:flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-purple-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                  <Users className="w-3 h-3" /> {dischargedPatients.length} Total
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold">
                  <Clock className="w-3 h-3" /> {roundedStayDays} Days
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                  <BarChart3 className="w-3 h-3" /> {totalWards} Wards
                </span>
              </div>

              {/* Export button (only when results exist) */}
              {hasActiveFilters && dischargedPatients.length > 0 && (
                <button className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium transition shadow-sm border border-slate-200 dark:border-slate-600">
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
              )}

              {/* Search Filter toggle */}
              <button
                onClick={() => setShowFilters(p => !p)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm border ${
                  showFilters
                    ? "bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
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
                {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* ── Collapsible Filter Panel (no overflow-hidden — avoids clipping DatePicker) ── */}
          {showFilters && (
            <div className="px-5 pb-5 pt-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">

              {/* Filter inputs row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">

                {/* Discharge From */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                    Discharge From
                  </label>
                  <DatePicker
                    selected={filters.DTFROM ? new Date(filters.DTFROM) : null}
                    onChange={(date: any) => handleFilterChange("DTFROM", date ? date.toISOString().split('T')[0] : '')}
                    className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none shadow-sm"
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select start date"
                  />
                </div>

                {/* Discharge To */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                    Discharge To
                  </label>
                  <DatePicker
                    selected={filters.dtto ? new Date(filters.dtto) : null}
                    onChange={(date: any) => handleFilterChange("dtto", date ? date.toISOString().split('T')[0] : '')}
                    className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select end date"
                  />
                </div>

                {/* MR Number */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                    MR Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.mrno}
                      onChange={e => handleFilterChange("mrno", e.target.value)}
                      placeholder="Enter MR Number"
                      className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm placeholder:text-slate-400"
                    />
                    {filters.mrno && (
                      <button onClick={() => handleFilterChange("mrno", "")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Patient Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                    Patient Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.patientname}
                      onChange={e => handleFilterChange("patientname", e.target.value)}
                      placeholder="Enter Patient Name"
                      className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm placeholder:text-slate-400"
                    />
                    {filters.patientname && (
                      <button onClick={() => handleFilterChange("patientname", "")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" /> Reset
                </button>
                <button
                  onClick={() => { setAppliedFilters(filters); setShowFilters(false); }}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-semibold shadow-sm"
                >
                  <Search className="w-4 h-4" /> Show Results
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Page Body ── */}
        <div className="px-5 py-5 space-y-4">

          {/* Stats strip (mobile — desktop lives in header) */}
          <div className="grid grid-cols-3 gap-3 md:hidden">
            <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3.5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none">{dischargedPatients.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3.5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600 leading-none">{roundedStayDays}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Days</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3.5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600 leading-none">{totalWards}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Wards</p>
              </div>
            </div>
          </div>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Active filters:</span>
              {appliedFilters.DTFROM && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                  <Calendar className="w-3 h-3" /> From: {appliedFilters.DTFROM}
                  <button onClick={() => { handleFilterChange("DTFROM", ""); setAppliedFilters(p => ({ ...p, DTFROM: "" })); }} className="ml-1 hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {appliedFilters.dtto && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                  <Calendar className="w-3 h-3" /> To: {appliedFilters.dtto}
                  <button onClick={() => { handleFilterChange("dtto", ""); setAppliedFilters(p => ({ ...p, dtto: "" })); }} className="ml-1 hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {appliedFilters.mrno && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-medium">
                  MR: {appliedFilters.mrno}
                  <button onClick={() => { handleFilterChange("mrno", ""); setAppliedFilters(p => ({ ...p, mrno: "" })); }} className="ml-1 hover:text-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {appliedFilters.patientname && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-medium">
                  Name: {appliedFilters.patientname}
                  <button onClick={() => { handleFilterChange("patientname", ""); setAppliedFilters(p => ({ ...p, patientname: "" })); }} className="ml-1 hover:text-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button onClick={handleResetFilters} className="text-slate-400 hover:text-red-500 transition flex items-center gap-1">
                <X className="w-3 h-3" /> Clear all
              </button>
            </div>
          )}

          {/* ── Virtualized Table ── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">

            {/* Table header */}
            <div className={`${gridClass} bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-semibold uppercase tracking-wide`}>
              <div className="px-2 py-3.5">Action</div>
              <div className="px-3 py-3.5">IPD / MR</div>
              <div className="px-3 py-3.5">Patient</div>
              <div className="hidden lg:block px-3 py-3.5">Contact</div>
              <div className="px-3 py-3.5">Ward</div>
              <div className="px-3 py-3.5">Consultant</div>
              <div className="hidden lg:block px-3 py-3.5">Admission</div>
              <div className="hidden lg:block px-3 py-3.5">Discharge</div>
              <div className="hidden lg:block px-3 py-3.5">Stay</div>
            </div>

            {dischargedPatients.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-7 h-7 text-slate-300 dark:text-slate-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">No discharged patients found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting the date range or search filters</p>
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
                      rowCount={dischargedPatients.length}
                      overscanRowCount={5}
                      rowRenderer={({ index, key, style }) =>
                        rowRenderer({ rowData: dischargedPatients[index], index, key, style })
                      }
                    />
                  )}
                </AutoSizer>
              </div>
            )}

            {/* Footer */}
            {dischargedPatients.length > 0 && (
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{dischargedPatients.length}</span> patients found
                  {hasActiveFilters && <span className="ml-2 text-amber-600 font-medium">• Filtered</span>}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Updated {new Date().toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default DischargedPatients;