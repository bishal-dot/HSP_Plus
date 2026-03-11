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
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuthToken } from "@/context/AuthContext";
import { useDischargedPatients } from "@/queries/discharged.queries";
import { dischargedPatientResponse } from "@/types/patient.type";
import { ThreeDots } from "react-loader-spinner";
import { useRouter } from "next/navigation";
import { AutoSizer, Table, List } from 'react-virtualized';
import 'react-virtualized/styles.css';

interface DischargedPatientsProps {
  onClose: () => void;
}

const DischargedPatients: React.FC<DischargedPatientsProps> = ({ onClose }) => {
  const { authToken } = useAuthToken();
  const router = useRouter();

  const [filters, setFilters] = useState({
    DTFROM: "",
    dtto: "",
    centercode: "1",
    patientname: "",
    mrno: ""
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

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

  const gridClass = "grid w-full grid-cols-1 md:grid-cols-[0.5fr_1fr_1.5fr_1.8fr_2fr_1.3fr_1.4fr_1.4fr_0.8fr] items-center";
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
            <FileText className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* IPD / MR */}
        <div className="px-3">
          <p className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
            IPD{patient.IPDCODE || "N/A"}
          </p>
          <p className="font-mono text-xs text-slate-400">{patient.Mrno}</p>
        </div>

        {/* Patient info */}
        <div className="px-3">
          <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{patient.PATIENTNAME || "N/A"}</p>
          <p className="text-xs text-slate-500">{patient.Age || "N/A"} yrs</p>
        </div>

        {/* Contact */}
        <div className="px-3 flex flex-col gap-0.5">
          <span className="flex gap-1 items-start text-xs text-slate-700 dark:text-slate-300">
            <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {patient.Mobile || "N/A"}
          </span>
          <span className="flex gap-1 items-start text-xs text-slate-500 truncate">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {patient.ADDRESS || "N/A"}
          </span>
        </div>

        {/* Ward */}
        <div className="px-3 flex gap-1 items-start text-xs text-slate-700 dark:text-slate-300">
          <Bed className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{patient.WARD || "N/A"}</span>
        </div>

        {/* Consultant */}
        <div className="px-3 flex gap-1 items-start text-xs text-slate-700 dark:text-slate-300">
          <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{patient.CONSULTANT || "N/A"}</span>
        </div>

        {/* Admission date */}
        <div className="px-3 flex flex-col gap-0.5">
          <span className="flex gap-1 items-center text-xs text-slate-700 dark:text-slate-300">
            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
            {patient.ADMITTEDTIME_E || "N/A"}
          </span>
          <span className="text-xs text-slate-400 pl-4">{patient.ADMITTEDTIME_N || ""}</span>
        </div>

        {/* Discharge date */}
        <div className="px-3 flex flex-col gap-0.5">
          <span className="flex gap-1 items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <Calendar className="w-3 h-3 shrink-0" />
            {patient.DISCHARGEDATE_E || "N/A"}
          </span>
          <span className="text-xs text-slate-400 pl-4">{patient.DISCHARGEDATE_N || ""}</span>
        </div>

        {/* Stay days */}
        <div className="px-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold">
            <Clock className="w-3 h-3" />
            {patient.STAYDAYS || "—"}d
          </span>
        </div>
      </div>
    );
  };

  const hasActiveFilters = appliedFilters.DTFROM || appliedFilters.dtto || appliedFilters.patientname || appliedFilters.mrno;

  return (
    <>
      {/* Loading overlay */}
      {isFetching && (
        <div className="fixed inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl text-center border border-slate-100 dark:border-slate-700">
            <ThreeDots
              height="60"
              width="60"
              radius="9"
              color="#2563eb"
              ariaLabel="three-dots-loading"
              wrapperStyle={{ margin: '0 auto' }}
              visible={true}
            />
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">Loading patients…</p>
          </div>
        </div>
      )}

      <div className="min-h-screen dark:bg-slate-900">
        <div className="max-w-full px-3 sm:px-5 md:px-7 md:py-6 space-y-4 md:space-y-5">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white leading-tight">
                  Discharged Patients
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Patients discharged within the selected date range
                </p>
              </div>
            </div>

            {hasActiveFilters && (
              <button className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-sm transition">
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            )}
          </div>

          {/* ── Stats strip ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3.5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none">{dischargedPatients.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total Discharged</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3.5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600 leading-none">6</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Avg Stay (Days)</p>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-800 rounded-xl px-4 py-3.5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600 leading-none">12</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Wards Covered</p>
              </div>
            </div>
          </div>

          {/* ── Filters card ── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 md:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                Search Filters
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition"
                >
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {/* From date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Discharge From
                </label>
                <DatePicker
                  selected={filters.DTFROM ? new Date(filters.DTFROM) : null}
                  onChange={(date: any) => handleFilterChange("DTFROM", date ? date.toISOString().split('T')[0] : '')}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select date"
                />
              </div>

              {/* To date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Discharge To
                </label>
                <DatePicker
                  selected={filters.dtto ? new Date(filters.dtto) : null}
                  onChange={(date: any) => handleFilterChange("dtto", date ? date.toISOString().split('T')[0] : '')}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select date"
                />
              </div>

              {/* MR Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">MR Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.mrno}
                    onChange={e => handleFilterChange("mrno", e.target.value)}
                    placeholder="Enter MR Number"
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder:text-slate-400"
                  />
                  {filters.mrno && (
                    <button onClick={() => handleFilterChange("mrno", "")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Patient Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Patient Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.patientname}
                    onChange={e => handleFilterChange("patientname", e.target.value)}
                    placeholder="Enter Patient Name"
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder:text-slate-400"
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
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => setAppliedFilters(filters)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-sm font-medium transition shadow-sm"
              >
                <Search className="w-4 h-4" /> Show Results
              </button>
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition"
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>

          {/* ── Active filter summary bar ── */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Active filters:</span>
              {appliedFilters.DTFROM && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                  <Calendar className="w-3 h-3" /> From: {appliedFilters.DTFROM}
                </span>
              )}
              {appliedFilters.dtto && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                  <Calendar className="w-3 h-3" /> To: {appliedFilters.dtto}
                </span>
              )}
              {appliedFilters.mrno && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-medium">
                  MR: {appliedFilters.mrno}
                </span>
              )}
              {appliedFilters.patientname && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-medium">
                  Name: {appliedFilters.patientname}
                </span>
              )}
            </div>
          )}

          {/* ── Virtualized Table ── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            {/* Sticky header */}
            <div className={`${gridClass} bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-semibold uppercase tracking-wide`}>
              <div className="px-2 py-3.5">Action.</div>
              <div className="px-3 py-3.5">IPD / MR</div>
              <div className="px-3 py-3.5">Patient</div>
              <div className="px-3 py-3.5">Contact</div>
              <div className="px-3 py-3.5">Ward</div>
              <div className="px-3 py-3.5">Consultant</div>
              <div className="px-3 py-3.5">Admission</div>
              <div className="px-3 py-3.5">Discharge</div>
              <div className="px-3 py-3.5">Stay</div>
            </div>

            {dischargedPatients.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No discharged patients found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting the date range or filters</p>
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
                      // rowGetter={({ index }) => dischargedPatients[index]}
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
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{dischargedPatients.length}</span> patients found
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