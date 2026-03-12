"use client";
import React, { useState } from 'react';
import {
  Users, Bed, Search, RefreshCw, ChevronRight,
  FileText, Phone, MapPin, Calendar, ArrowUpDown, Download,
  BedDouble, Activity, UserCheck, Clipboard, BarChart3, Moon, Sun,
  AlertTriangle, Home, Stethoscope
} from 'lucide-react';
import { useAuthToken } from '@/context/AuthContext';
import { inPatientRequest, inPatientResponse } from '@/types/patient.type';
import { useIPDPatients } from '@/queries/ipd.queries';
import DischargedPatients from './DischargedPatients';
import { useRouter } from 'next/navigation';

const IPDDashboard: React.FC = () => {
  const { authToken } = useAuthToken();

  const [showDischarged, setShowDischarged] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [dark, setDark] = useState(false);

  const { data, isLoading, isFetching, refetch } = useIPDPatients(authToken, { centerCode: '', search: searchQuery });
  const inPatients = data?.data ?? [];
  const router = useRouter();

  const openConsultantNotes = (Patient: any) => {
    sessionStorage.setItem('selectedPatient', JSON.stringify(Patient));
    const faculty = Patient.wardName;
      router.push(`/consultant-notes/${Patient.PatientCode}`);
    
  };

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const totalAdmitted = inPatients.length;
  const totalBeds = inPatients.reduce((sum: number, p: inPatientResponse) => sum + 1, 0);
  const occupiedBeds = inPatients.filter((p: inPatientResponse) => p.bedno && p.bedno !== '').length;
  const availableBeds = totalBeds - occupiedBeds;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const wards = ['all', ...Array.from(new Set(inPatients.map((p: inPatientResponse) => p.wardName).filter(Boolean)))];
  const filteredPatients = selectedWard === 'all'
    ? inPatients
    : inPatients.filter((p: inPatientResponse) => p.wardName === selectedWard);

  const circumference = 2 * Math.PI * 22;

  return (
      <div className="min-h-screen dark:bg-slate-950 transition-colors duration-200">

        {/* ── Slim loading bar ── */}
        {isFetching && (
          <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-gradient-to-r from-purple-500 via-purple-400 to-violet-500 animate-pulse" />
        )}

        {showDischarged ? (
          <DischargedPatients onClose={() => setShowDischarged(false)} />
        ) : (
          <div className="min-h-screen p-3 sm:p-4 md:p-6">
            <div className="max-w-full mx-auto space-y-4 md:space-y-5">

              {/* ══════════════════════════════════════
                  HEADER
              ══════════════════════════════════════ */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3 text-slate-800 dark:text-slate-100">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
                      <BedDouble className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    Inpatient Department
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base pl-0 sm:pl-12">
                    Manage admitted patients and bed allocation
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                  <button
                    onClick={() => refetch()}
                    className="px-3 py-2 md:px-4 md:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-150 flex items-center gap-2 shadow-sm text-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-purple-600' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>

                  <button className="px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all duration-150 flex items-center gap-2 shadow-md shadow-purple-500/25 text-sm font-medium">
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </div>
              </div>

              {/* ══════════════════════════════════════
                  STAT CARDS
              ══════════════════════════════════════ */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">

                {/* Total Admitted */}
                <div className="relative overflow-hidden bg-white dark:bg-slate-800/80 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md dark:shadow-none border border-slate-200/80 dark:border-slate-700/60 transition-all duration-200 group">
                  <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-purple-500 to-violet-500" />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Total Admitted</p>
                      <p className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-none">{totalAdmitted}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Active patients</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </div>

                {/* Total Beds */}
                <div className="relative overflow-hidden bg-white dark:bg-slate-800/80 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md dark:shadow-none border border-slate-200/80 dark:border-slate-700/60 transition-all duration-200 group">
                  <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-blue-500 to-sky-400" />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Total Beds</p>
                      <p className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-none">{totalBeds}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">All wards</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                      <Bed className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                {/* Occupied */}
                <div className="relative overflow-hidden bg-white dark:bg-slate-800/80 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md dark:shadow-none border border-slate-200/80 dark:border-slate-700/60 transition-all duration-200 group">
                  <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-amber-500 to-yellow-400" />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Occupied</p>
                      <p className="text-3xl md:text-4xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight leading-none">{occupiedBeds}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Currently in use</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                      <UserCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </div>

                {/* Available */}
                <div className="relative overflow-hidden bg-white dark:bg-slate-800/80 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md dark:shadow-none border border-slate-200/80 dark:border-slate-700/60 transition-all duration-200 group">
                  <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-emerald-500 to-green-400" />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Available</p>
                      <p className="text-3xl md:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">{availableBeds}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Ready for use</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                      <BedDouble className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </div>

                {/* Occupancy Rate — Hero */}
                <div className="col-span-2 md:col-span-3 lg:col-span-1 relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-600 to-violet-700 rounded-2xl p-4 md:p-5 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200 group text-white">
                  {/* Decorative blobs */}
                  <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10 blur-xl pointer-events-none" />
                  <div className="absolute -left-2 -bottom-4 w-16 h-16 rounded-full bg-violet-400/20 blur-xl pointer-events-none" />

                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-purple-200 mb-2">Occupancy Rate</p>
                      <p className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none">{occupancyRate}%</p>
                      <p className="text-xs text-purple-300 mt-1.5">Current capacity</p>
                    </div>

                    {/* SVG Ring */}
                    <div className="relative w-14 h-14 flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                      <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
                        <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
                        <circle
                          cx="28" cy="28" r="22" fill="none"
                          stroke="rgba(255,255,255,0.85)" strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={circumference * (1 - occupancyRate / 100)}
                          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">
                        {occupancyRate}%
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* ══════════════════════════════════════
                  QUICK ACTIONS + SEARCH
              ══════════════════════════════════════ */}
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm dark:shadow-none border border-slate-200/80 dark:border-slate-700/60 p-3 md:p-4">
                <div className="flex flex-wrap items-center gap-2 md:gap-2.5">

                  <button
                    onClick={() => setShowDischarged(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-150 shadow-md shadow-purple-500/25 font-semibold text-sm"
                  >
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>Discharged Patients</span>
                  </button>

                  <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-150 shadow-md shadow-blue-500/25 font-semibold text-sm">
                    <Bed className="w-4 h-4 flex-shrink-0" />
                    <span>Bed Status</span>
                  </button>

                  <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-150 font-medium text-sm">
                    <Clipboard className="w-4 h-4 flex-shrink-0" />
                    <span>Discharge Queue</span>
                  </button>

                  {/* Search */}
                  <div className="w-full md:flex-1 md:max-w-none lg:flex-1 lg:max-w-md mt-1 md:mt-0 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, MR No., IP No..."
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl
                                 bg-slate-50 dark:bg-slate-700/50
                                 text-slate-800 dark:text-slate-200
                                 placeholder-slate-400 dark:placeholder-slate-500
                                 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 dark:focus:border-purple-500
                                 outline-none transition-all duration-150 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* ══════════════════════════════════════
                  WARD FILTER TABS
              ══════════════════════════════════════ */}
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm dark:shadow-none border border-slate-200/80 dark:border-slate-700/60 p-3 md:p-3.5">
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
                  {wards.map((ward: any) => (
                    <button
                      key={ward}
                      onClick={() => setSelectedWard(ward)}
                      className={`px-3.5 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-150 whitespace-nowrap flex-shrink-0
                        ${selectedWard === ward
                          ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-500/25'
                          : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                      {ward === 'all' ? 'All Wards' : ward}
                    </button>
                  ))}
                </div>
              </div>

              {/* ══════════════════════════════════════
                  PATIENTS TABLE
              ══════════════════════════════════════ */}
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm dark:shadow-none border border-slate-200/80 dark:border-slate-700/60 overflow-hidden">

                {/* Table meta bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Admitted Patients</span>
                    <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[11px] font-bold">
                      {filteredPatients.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 dark:text-slate-500">{isFetching ? 'Refreshing…' : 'Live'}</span>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isFetching ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}
                          style={{ boxShadow: isFetching ? '0 0 6px rgba(251,191,36,0.7)' : '0 0 6px rgba(52,211,153,0.7)' }} />
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="min-w-[720px] w-full border-collapse">

                    {/* ── THEAD ── */}
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-700 via-purple-600 to-violet-600">

                        {/* Sticky action header */}
                        <th className="sticky left-0 z-30 px-3 md:px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-white/80 bg-purple-800 w-[90px] border-r border-white/10">
                          Action
                        </th>

                        <th className="px-3 md:px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-white/70 border-l border-purple-500/40">
                          MR No.
                        </th>

                        <th className="hidden xl:table-cell px-3 md:px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-white/70 border-l border-purple-500/40">
                          <div className="flex items-center justify-between gap-1">
                            IP No.
                            <button onClick={() => handleSort('ipNo')} className="hover:bg-white/10 p-0.5 rounded transition">
                              <ArrowUpDown className="w-3 h-3 opacity-60 hover:opacity-100" />
                            </button>
                          </div>
                        </th>

                        <th className="px-3 md:px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-white/70 border-l border-purple-500/40">
                          <div className="flex items-center justify-between gap-1">
                            Patient Info
                            <button onClick={() => handleSort('name')} className="hover:bg-white/10 p-0.5 rounded transition">
                              <ArrowUpDown className="w-3 h-3 opacity-60 hover:opacity-100" />
                            </button>
                          </div>
                        </th>

                        <th className="hidden xl:table-cell px-3 md:px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-white/70 border-l border-purple-500/40">
                          Contact Info
                        </th>

                        <th className="px-3 md:px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-white/70 border-l border-purple-500/40">
                          <div className="flex items-center justify-between gap-1">
                            Admit Date
                            <button onClick={() => handleSort('admitDate')} className="hover:bg-white/10 p-0.5 rounded transition">
                              <ArrowUpDown className="w-3 h-3 opacity-60 hover:opacity-100" />
                            </button>
                          </div>
                        </th>

                        <th className="px-3 md:px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-white/70 border-l border-purple-500/40">
                          <div className="flex items-center justify-between gap-1">
                            Ward
                            <button onClick={() => handleSort('ward')} className="hover:bg-white/10 p-0.5 rounded transition">
                              <ArrowUpDown className="w-3 h-3 opacity-60 hover:opacity-100" />
                            </button>
                          </div>
                        </th>

                        <th className="px-3 md:px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-white/70 border-l border-purple-500/40">
                          Bed
                        </th>

                        <th className="hidden xl:table-cell px-3 md:px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-white/70 border-l border-purple-500/40">
                          Report
                        </th>
                      </tr>
                    </thead>

                    {/* ── TBODY ── */}
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                      {inPatients.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-16 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mx-auto mb-3">
                              <Bed className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                            </div>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No admitted patients found</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your filters</p>
                          </td>
                        </tr>
                      ) : (
                        filteredPatients.map((patient: inPatientResponse, idx: any) => (
                          <tr
                            key={idx}
                            className="hover:bg-purple-50/40 dark:hover:bg-purple-900/10 transition-colors duration-100 group"
                          >
                            {/* Sticky Action */}
                            <td className="px-2 md:px-3 py-3 sticky left-0 z-10
                                           bg-white dark:bg-slate-800
                                           group-hover:bg-purple-50/40 dark:group-hover:bg-purple-900/10
                                           border-r border-slate-100 dark:border-slate-700/60">
                              <div className="flex items-center gap-1.5" onClick={() => openConsultantNotes(patient)}>
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-purple-500 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-700 dark:hover:text-purple-300 border border-transparent hover:border-purple-200 dark:hover:border-purple-700/50 transition-all duration-150">
                                  <FileText className="w-4 h-4" />
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 border border-transparent hover:border-blue-200 dark:hover:border-blue-700/50 transition-all duration-150">
                                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                              </div>
                            </td>

                            {/* MR No. */}
                            <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                              <span className="font-mono text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {patient.PatientCode}
                              </span>
                            </td>

                            {/* IP No. */}
                            <td className="hidden xl:table-cell px-3 md:px-4 py-3 whitespace-nowrap">
                              <span className="font-mono text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {patient.IPDCODE}
                              </span>
                            </td>

                            {/* Patient Info */}
                            <td className="px-3 md:px-4 py-3">
                              <p className="font-semibold text-sm whitespace-nowrap text-slate-800 dark:text-slate-200">
                                {patient.patientname}
                              </p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 whitespace-nowrap">
                                {patient.Age}
                              </p>
                            </td>

                            {/* Contact */}
                            <td className="hidden xl:table-cell px-3 md:px-4 py-3">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                <Phone className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                                {patient.Mobile}
                              </div>
                              <div className="flex items-start gap-1.5 mt-1 max-w-[180px]">
                                <MapPin className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{patient.ADDRESS}</p>
                              </div>
                            </td>

                            {/* Admit Date */}
                            <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                  {new Date(patient.AdmitDate).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric',
                                  })}
                                </span>
                              </div>
                            </td>

                            {/* Ward */}
                            <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide
                                ${patient.ward === 'ICU'
                                  ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40'
                                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200/60 dark:border-purple-700/40'
                                }`}>
                                {patient.ward === 'ICU' && <AlertTriangle className="w-2.5 h-2.5" />}
                                {patient.ward}
                              </span>
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 whitespace-nowrap">
                                {patient.wardName}
                              </p>
                            </td>

                            {/* Bed */}
                            <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-700/40">
                                <Bed className="w-3 h-3 flex-shrink-0" />
                                <span className="font-mono text-xs font-bold">{patient.bedno}</span>
                              </div>
                            </td>

                            {/* Reporting */}
                            <td className="hidden xl:table-cell px-3 md:px-4 py-3">
                              <div className="flex items-start gap-1.5 max-w-[180px]">
                                <Activity className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{patient.Gphreporting}</p>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ══════════════════════════════════════
                  PAGINATION
              ══════════════════════════════════════ */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3
                              bg-white dark:bg-slate-800/80
                              border border-slate-200/80 dark:border-slate-700/60
                              px-4 md:px-5 py-3.5 rounded-2xl shadow-sm dark:shadow-none">
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                  Showing{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">1–{filteredPatients.length}</span>
                  {' '}of{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{totalAdmitted}</span>
                  {' '}admitted patients
                </p>
                <div className="flex gap-1.5 md:gap-2">
                  <button
                    disabled
                    className="px-3 py-1.5 md:px-4 md:py-2 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                  >
                    Previous
                  </button>
                  <button className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl shadow-md shadow-purple-500/25 text-sm font-semibold">
                    1
                  </button>
                  <button className="px-3 py-1.5 md:px-4 md:py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-150 text-sm">
                    2
                  </button>
                  <button className="px-3 py-1.5 md:px-4 md:py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-150 text-sm">
                    Next
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
  );
};

export default IPDDashboard;