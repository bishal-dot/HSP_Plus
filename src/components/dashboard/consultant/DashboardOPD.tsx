'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  ChevronRight,
  RefreshCw,
  Stethoscope,
  Calendar,
  ChevronDown,
  Activity,
  Clock,
  UserCheck,
  Search,
  X,
  FileText,
} from 'lucide-react';
import { useAuthToken } from '@/context/AuthContext';
import { useOPDPatientsDayWise, useOPDPatientsDayWiseCount } from '@/queries/opd.queries';
import { useRouter } from 'next/navigation';
import OPDALLPatients from './OPDALLPatients';

const DATE_OPTIONS = [
  'Today',
  'Yesterday',
  'This Week',
  'Previous Week',
  'This Month',
  'Previous Month',
  'Custom',
];

const OPDDashboard: React.FC = () => {
  const { authToken, consultantCode, username, isConsultant } = useAuthToken();
  const router = useRouter();

  const [show, setShow] = useState(false);
  const [showAllPatients, setShowAllPatients] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [dateFilter, setDateFilter] = useState('Today');
  const [dateOpen, setDateOpen] = useState(false);
  const [customDate, setCustomDate] = useState({ from: '', to: '' });
  const dateRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dateRef.current?.contains(e.target as Node)) {
        setDateOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getDateRange = () => {
    const today = new Date();
    let fromDate = '';
    let toDate = '';

    switch (dateFilter) {
      case 'Today':
        fromDate = toDate = today.toISOString().split('T')[0];
        break;
      case 'Yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        fromDate = toDate = yesterday.toISOString().split('T')[0];
        break;
      case 'This Week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        fromDate = startOfWeek.toISOString().split('T')[0];
        toDate = today.toISOString().split('T')[0];
        break;
      case 'Previous Week':
        const prevWeekEnd = new Date(today);
        prevWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        const prevWeekStart = new Date(prevWeekEnd);
        prevWeekStart.setDate(prevWeekEnd.getDate() - 6);
        fromDate = prevWeekStart.toISOString().split('T')[0];
        toDate = prevWeekEnd.toISOString().split('T')[0];
        break;
      case 'This Month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        fromDate = startOfMonth.toISOString().split('T')[0];
        toDate = today.toISOString().split('T')[0];
        break;
      case 'Previous Month':
        const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        fromDate = prevMonthStart.toISOString().split('T')[0];
        toDate = prevMonthEnd.toISOString().split('T')[0];
        break;
      case 'Custom':
        fromDate = customDate.from;
        toDate = customDate.to;
        break;
      default:
        fromDate = toDate = '';
    }
    return { fromDate, toDate };
  };

  const openConsultantNotes = (Patient: any) => {
    sessionStorage.setItem('selectedPatient', JSON.stringify(Patient));
    const faculty = Patient.FacultyName;
    
    router.push(`/consultant-notes/${Patient.MRNo}`);
    
  };

  const openAllPatients = () => {
    router.push('/dashboard/opd/patients');
  };

  const { fromDate, toDate } = getDateRange();

  const getToday = () => {
    const today = new Date();
    if (dateFilter === 'Yesterday') today.setDate(today.getDate() - 1);
    return today.toISOString().split('T')[0];
  };

  const { data: opdPatientDayWise, isLoading, isFetching, refetch } = useOPDPatientsDayWise(authToken, {
    DTODAY: '2026-01-19',
    deptcode: 1,
    consultantcode: consultantCode,
    centerid: 1,
  });

  const patients = opdPatientDayWise?.data ?? [];

  const { data: patientcount = [] } = useOPDPatientsDayWiseCount(authToken, {
    DTODAY: '2026-01-19',
    centerid: 1,
    deptcode: 1,
  })

  // Client-side search filter
  const filteredPatients = patients.filter((p: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.PatientName?.toLowerCase().includes(q) ||
      p.MRNo?.toString().includes(q) ||
      p.TokenNo?.toString().includes(q) ||
      p.ContactNo?.includes(q)
    );
  });

  const totalPatients = patientcount[0]?.totalpatient ?? 0;
  const waitingCount = patientcount[0]?.pending ?? 0;
  const checkedInCount = patientcount[0]?.checked ?? 0;


  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 100000) return (num / 1000).toFixed(0) + 'k';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const formatDateLabel = () => {
    if (!fromDate) return '—';
    if (fromDate === toDate) {
      return new Date(fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return `${new Date(fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium text-sm">Loading OPD patients…</p>
        </div>
      </div>
    );
  }

  return (
    <>
        <div className="min-h-screen dark:bg-slate-900">

          {/* Refreshing toast */}
          {isFetching && (
            <div className="fixed top-4 right-4 z-50 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow-lg border border-blue-200 dark:border-blue-900 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin flex-shrink-0" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Refreshing…</span>
            </div>
          )}

          <div className="max-w-full px-3 sm:px-5 md:px-7 py-4 md:py-6 space-y-4 md:space-y-5">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-xl shadow-md shadow-blue-200 flex-shrink-0">
                  <Stethoscope className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white leading-tight">
                    OutPatient Department
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isConsultant
                      ? `Welcome, ${username} — your patients today`
                      : 'Real-time patient queue management'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                {/* Date filter dropdown */}
                {/* <div className="relative" ref={dateRef}>
                  <button
                    onClick={() => setDateOpen(!dateOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span>{dateFilter}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dateOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dateOpen && (
                    <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                      {DATE_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => { setDateFilter(opt); if (opt !== 'Custom') setDateOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-medium transition hover:bg-blue-50 dark:hover:bg-slate-700 ${
                            dateFilter === opt
                              ? 'text-blue-600 bg-blue-50 dark:bg-slate-700 dark:text-blue-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                      {dateFilter === 'Custom' && (
                        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-slate-100 dark:border-slate-700">
                          <label className="text-xs text-slate-500 dark:text-slate-400">From</label>
                          <input
                            type="date"
                            value={customDate.from}
                            onChange={(e) => setCustomDate((d) => ({ ...d, from: e.target.value }))}
                            className="w-full text-xs px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <label className="text-xs text-slate-500 dark:text-slate-400">To</label>
                          <input
                            type="date"
                            value={customDate.to}
                            onChange={(e) => setCustomDate((d) => ({ ...d, to: e.target.value }))}
                            className="w-full text-xs px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => setDateOpen(false)}
                            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition"
                          >
                            Apply
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div> */}

                {/* Show All Patients */}
                <button
                  onClick={() => openAllPatients()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-medium shadow-sm shadow-blue-200 transition"
                >
                  <Users className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden sm:inline">All Patients</span>
                  <span className="sm:hidden">All</span>
                </button>

                {/* Refresh */}
                <button
                  onClick={() => { refetch(); setShow(false); }}
                  title="Refresh"
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95"
                >
                  <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-300 transition-transform ${isFetching ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* ── Stats Strip ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3.5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none">{formatNumber(totalPatients)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3.5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600 leading-none">{checkedInCount}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Checked In</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3.5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600 leading-none">{waitingCount}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Waiting</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3.5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight truncate">{formatDateLabel()}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {isConsultant ? `Code: ${consultantCode}` : 'Admin View'}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Toolbar: Search + role badge ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, MR No., token…"
                  className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm transition placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {isConsultant ? (
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap">
                  <Activity className="w-3 h-3" /> Your patients only
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap">
                  <Activity className="w-3 h-3" /> Admin — all patients
                </span>
              )}

              {searchQuery && (
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {filteredPatients.length} result{filteredPatients.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* ── Table ── */}
            <div className="">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-auto max-h-[600px]">
                <table className="min-w-[680px] w-full border-collapse">
                  <thead className='sticky top-0 z-20'>
                    <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs uppercase tracking-wide">
                      <th className="px-4 md:px-5 py-3.5 sticky left-0 z-20 bg-blue-600 text-left font-semibold whitespace-nowrap">Actions</th>
                      <th className="px-4 md:px-5 py-3.5 text-left font-semibold whitespace-nowrap">Token</th>
                      <th className="px-4 md:px-5 py-3.5 text-left font-semibold whitespace-nowrap">MR No.</th>
                      <th className="px-4 md:px-5 py-3.5 text-left font-semibold whitespace-nowrap">Patient</th>
                      <th className="px-4 md:px-5 py-3.5 text-left font-semibold whitespace-nowrap hidden lg:table-cell">Age</th>
                      <th className="px-4 md:px-5 py-3.5 text-left font-semibold whitespace-nowrap hidden lg:table-cell">Contact</th>
                      <th className="px-4 md:px-5 py-3.5 text-left font-semibold whitespace-nowrap hidden lg:table-cell">Faculty</th>
                      <th className="px-4 md:px-5 py-3.5 text-left font-semibold whitespace-nowrap hidden lg:table-cell">Consultant</th>
                      <th className="px-4 md:px-5 py-3.5 text-left font-semibold whitespace-nowrap">Status</th>
                      <th className="px-4 md:px-5 py-3.5 text-left font-semibold whitespace-nowrap hidden md:table-cell">Wait</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((p: any, idx: number) => {
                        const isCheckedIn = p.CheckIn && p.CheckIn !== '';
                        return (
                          <tr
                            key={idx}
                            className="hover:bg-blue-50/40 dark:hover:bg-slate-700/40 transition-colors"
                          >
                            <td className="px-2 py-2.5 sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-purple-50/40 dark:group-hover:bg-purple-900/10 border-r border-slate-100 dark:border-slate-700/60">
                              <div className="flex items-center gap-1">
                                <button className="w-7 h-7 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-transparent hover:border-blue-200 transition-all"
                                  onClick={() => openConsultantNotes(p)}
                                ><FileText className="w-4.5 h-4.5" /></button>
                                <button className="w-7 h-7 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-transparent hover:border-blue-200 transition-all"
                                  onClick={() => openConsultantNotes(p)}
                                ><ChevronRight className="w-4.5 h-4.5" /></button>
                              </div>
                            </td>

                            {/* Token bubble */}
                            <td className="xl:table-cell px-3 md:px-4 py-3 whitespace-nowrap">
                              <span className="font-mono text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {p.TokenNo}
                              </span>
                            </td>

                            <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                              <span className="font-mono text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {p.MRNo}
                              </span>
                            </td>

                            <td className="px-4 md:px-5 py-3">
                              <p className="font-semibold text-sm md:text-xs text-slate-800 dark:text-white whitespace-nowrap">{p.PatientName}</p>
                            </td>

                            <td className="px-4 md:px-5 py-3 text-xs text-slate-600 dark:text-slate-400 hidden lg:table-cell whitespace-nowrap">
                              {p.Age}
                            </td>

                            <td className="px-4 md:px-5 py-3 text-xs text-slate-600 dark:text-slate-400 hidden lg:table-cell whitespace-nowrap">
                              {p.ContactNo}
                            </td>

                            <td className="px-4 md:px-5 py-3 text-xs text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                              {p.FacultyName}
                            </td>

                            <td className="px-4 md:px-5 py-3 text-xs text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                              {p.BlockedBy}
                            </td>

                            {/* Status badge */}
                            <td className="px-4 md:px-5 py-3">
                              {isCheckedIn ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium whitespace-nowrap">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block flex-shrink-0" />
                                  {p.CheckIn}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium whitespace-nowrap">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse flex-shrink-0" />
                                  Waiting
                                </span>
                              )}
                            </td>

                            <td className="px-4 md:px-5 py-3 text-xs text-slate-500 dark:text-slate-400 hidden md:table-cell whitespace-nowrap">
                              {p.WaitingTime || '—'}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={10} className="px-4 py-14 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                              <Users className="w-7 h-7 text-slate-400" />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                              {searchQuery
                                ? `No patients match "${searchQuery}"`
                                : isConsultant
                                ? 'No patients assigned to you for this date'
                                : 'No patients found for this date range'}
                            </p>
                            {searchQuery ? (
                              <button onClick={() => setSearchQuery('')} className="text-xs text-blue-600 hover:underline">
                                Clear search
                              </button>
                            ) : (
                              <p className="text-xs text-slate-400">Try selecting a different date</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table footer */}
              <div className="px-4 md:px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Showing{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredPatients.length}</span>
                  {searchQuery && ` of ${totalPatients}`} patients
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Updated {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
    </>
  );
};

export default OPDDashboard;