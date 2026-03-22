"use client";
import React, { useState } from 'react';
import {
  Users, Bed, Search, RefreshCw, ChevronRight,
  FileText, Phone, MapPin, Calendar, ArrowUpDown,
  BedDouble, Activity, UserCheck, AlertTriangle, Stethoscope,
} from 'lucide-react';
import { useAuthToken } from '@/context/AuthContext';
import { inPatientResponse } from '@/types/patient.type';
import { useIPDPatients } from '@/queries/ipd.queries';
import { useRouter } from 'next/navigation';

const IPDDashboard: React.FC = () => {
  const { authToken } = useAuthToken();
  const router        = useRouter();

  const [searchQuery,  setSearchQuery]  = useState('');
  const [selectedWard, setSelectedWard] = useState('all');
  const [sortConfig,   setSortConfig]   = useState({ key: '', direction: 'asc' });

  const { data, isFetching, refetch } = useIPDPatients(authToken, { centerCode: '', search: searchQuery });
  const inPatients = data?.data ?? [];

  const openConsultantNotes = (patient: any) => {
    sessionStorage.setItem('selectedPatient', JSON.stringify(patient));
    router.push(`/consultant-notes/${patient.PatientCode}`);
  };
  
  const openDischarged = () => {
    router.push('/dashboard/ipd/discharged');
  };

  const handleSort = (key: string) =>
    setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc' });

  const totalAdmitted = inPatients.length;
  const occupiedBeds  = inPatients.filter((p: inPatientResponse) => p.bedno && p.bedno !== '').length;
  const availableBeds = totalAdmitted - occupiedBeds;

  const wards = ['all', ...Array.from(new Set(inPatients.map((p: inPatientResponse) => p.wardName).filter(Boolean)))];
  const filteredPatients = selectedWard === 'all'
    ? inPatients
    : inPatients.filter((p: inPatientResponse) => p.wardName === selectedWard);

  return (
    <div className="sm:p-4  space-y-4 mb-10">

      {/* Loading bar */}
      {isFetching && (
        <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-gradient-to-r from-purple-500 via-purple-400 to-violet-500 animate-pulse" />
      )}

      {/* ── Top bar: title + stats + search + refresh ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-purple-500 to-violet-500" />

        <div className="px-5 py-3.5 flex flex-wrap items-center gap-3 justify-between">
          {/* Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700/40 flex items-center justify-center flex-shrink-0">
              <BedDouble className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">Inpatient Department</h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Manage admitted patients</p>
            </div>
          </div>

          {/* Stat chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: "Admitted",  value: totalAdmitted, color: "purple" },
              { label: "Occupied",  value: occupiedBeds,  color: "amber"  },
              { label: "Available", value: availableBeds, color: "emerald"},
            ].map(({ label, value, color }) => {
              const cls: Record<string, string> = {
                purple:  "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-800/30",
                amber:   "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800/30",
                emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30",
              };
              return (
                <div key={label} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${cls[color]}`}>
                  <span className="text-base font-extrabold leading-none">{value}</span>
                  <span className="font-medium opacity-75">{label}</span>
                </div>
              );
            })}
          </div>

          {/* Search + Refresh */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, MR No., IP No…"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 dark:focus:border-purple-500 transition-all"
              />
            </div>
            {/* Show All Patients */}
            <button
              onClick={() => openDischarged()}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-lg text-xs font-medium shadow-sm shadow-blue-200 transition"
            >
              <Users className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Discharged Patients</span>
              <span className="sm:hidden">All</span>
            </button>
            <button onClick={() => refetch()}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-purple-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Ward filter inline */}
        <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5 flex-wrap bg-slate-50/60 dark:bg-slate-800/40">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mr-0.5">Ward</span>
          {wards.map((ward: any) => (
            <button key={ward} onClick={() => setSelectedWard(ward)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all whitespace-nowrap
                ${selectedWard === ward
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-600'}`}>
              {ward === 'all' ? 'All Wards' : ward}
            </button>
          ))}
        </div>
      </div>

      {/* ── Patients table ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">

        {/* Table meta */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Admitted Patients</span>
            <span className="inline-flex items-center justify-center min-w-[20px] h-4.5 px-1.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
              {filteredPatients.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 dark:text-slate-500">{isFetching ? 'Refreshing…' : 'Live'}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isFetching ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          </div>
        </div>

        <div className="overflow-auto max-h-[600px]">
          <table className="min-w-[720px] w-full border-collapse">
            <thead className="sticky top-0 z-20">
              <tr className="bg-gradient-to-r from-purple-700 via-purple-600 to-violet-600">
                {[
                  { label: "Action",       sticky: true,  sort: false },
                  { label: "MR No.",       sticky: false, sort: false },
                  { label: "IP No.",       sticky: false, sort: true,  key: "ipNo",     hidden: true },
                  { label: "Patient Info", sticky: false, sort: true,  key: "name"      },
                  { label: "Contact Info", sticky: false, sort: false, hidden: true     },
                  { label: "Admit Date",   sticky: false, sort: true,  key: "admitDate" },
                  { label: "Ward",         sticky: false, sort: true,  key: "ward"      },
                  { label: "Bed",          sticky: false, sort: false  },
                  { label: "Report",       sticky: false, sort: false, hidden: true     },
                ].map((h, i) => (
                  <th key={i} className={`
                    px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-white/80 border-l border-purple-500/30 first:border-l-0
                    ${h.sticky ? 'sticky left-0 z-30 bg-purple-800 w-[80px]' : ''}
                    ${h.hidden ? 'hidden xl:table-cell' : ''}
                  `}>
                    {h.sort
                      ? <div className="flex items-center justify-between gap-1">{h.label}<button onClick={() => handleSort(h.key!)} className="hover:bg-white/10 p-0.5 rounded transition"><ArrowUpDown className="w-3 h-3 opacity-50 hover:opacity-100" /></button></div>
                      : h.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {inPatients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-3">
                      <Bed className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No admitted patients</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or ward filter</p>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient: inPatientResponse, idx: number) => (
                  <tr key={idx} onClick={() => openConsultantNotes(patient)}
                    className="hover:bg-purple-50/40 dark:hover:bg-purple-900/10 transition-colors cursor-pointer group">

                    {/* Action */}
                    <td className="px-2 py-2.5 sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-purple-50/40 dark:group-hover:bg-purple-900/10 border-r border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center gap-1">
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-transparent hover:border-purple-200 transition-all"><FileText className="w-4 h-4" /></button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-transparent hover:border-blue-200 transition-all"><ChevronRight className="w-4 h-4" /></button>
                      </div>
                    </td>

                    {/* MR No */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{patient.PatientCode}</span>
                    </td>

                    {/* IP No */}
                    <td className="hidden xl:table-cell px-3 py-2.5 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{patient.IPDCODE}</span>
                    </td>

                    {/* Patient */}
                    <td className="px-3 py-2.5">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{patient.patientname}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{patient.Age}</p>
                    </td>

                    {/* Contact */}
                    <td className="hidden xl:table-cell px-3 py-2.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap"><Phone className="w-3 h-3 text-slate-300 flex-shrink-0" />{patient.Mobile}</div>
                      <div className="flex items-start gap-1.5 mt-0.5 max-w-[160px]"><MapPin className="w-3 h-3 text-slate-300 flex-shrink-0 mt-0.5" /><p className="text-xs text-slate-400 truncate">{patient.ADDRESS}</p></div>
                    </td>

                    {/* Admit date */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                        <span className="text-xs text-slate-700 dark:text-slate-300">
                          {new Date(patient.AdmitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </td>

                    {/* Ward */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase
                        ${patient.ward === 'ICU'
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40'
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200/60 dark:border-purple-700/40'}`}>
                        {patient.ward === 'ICU' && <AlertTriangle className="w-2.5 h-2.5" />}
                        {patient.ward}
                      </span>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{patient.wardName}</p>
                    </td>

                    {/* Bed */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-700/40">
                        <Bed className="w-3 h-3 flex-shrink-0" />
                        <span className="font-mono text-xs font-bold">{patient.bedno}</span>
                      </div>
                    </td>

                    {/* Report */}
                    <td className="hidden xl:table-cell px-3 py-2.5">
                      <div className="flex items-start gap-1.5 max-w-[180px]">
                        <Activity className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-400 whitespace-nowrap">{patient.Gphreporting}</p>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/40">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-600 dark:text-slate-300">{filteredPatients.length}</span> of <span className="font-semibold text-slate-600 dark:text-slate-300">{totalAdmitted}</span> patients
            {selectedWard !== 'all' && <span className="ml-2 text-purple-500">· Filtered by {selectedWard}</span>}
          </p>
        </div>
      </div>

    </div>
  );
};

export default IPDDashboard;