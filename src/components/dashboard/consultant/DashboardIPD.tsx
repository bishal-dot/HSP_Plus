"use client";
import React, { useEffect, useState } from 'react';
import { 
  Users, Bed, Search, Filter, RefreshCw, ChevronRight, 
  FileText, Phone, MapPin, Calendar, ArrowUpDown, Download,
  BedDouble, Activity, User, UserCheck, TrendingUp, Home,
  Clock, AlertCircle, Stethoscope, Clipboard, BarChart3,
  Key
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

  const { data, isLoading, isFetching, refetch } = useIPDPatients(authToken, { centerCode: '', search: searchQuery });

  const inPatients = data?.data ?? [];

  const router = useRouter();

  const openConsultantNotes = (Patient: any) => {
    sessionStorage.setItem('selectedPatient', JSON.stringify(Patient));
    const faculty = Patient.FacultyName;
    router.push(`/consultant-notes/${Patient.PatientCode}`); 
  };

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const totalAdmitted = inPatients.length;

  const totalBeds = inPatients.reduce((sum: number, p: inPatientResponse) => {
    return sum + 1;
  }, 0);

  const occupiedBeds = inPatients.filter((p: inPatientResponse) => p.bedno && p.bedno !== '').length;
  const availableBeds = totalBeds - occupiedBeds;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // filter wards
  const wards = ['all', ...Array.from(new Set(inPatients.map((p: inPatientResponse) => p.wardName).filter(Boolean)))];

  // filter patients based on selected ward
  const filteredPatients = selectedWard === 'all' ? inPatients : inPatients.filter((p: inPatientResponse) => p.wardName === selectedWard);

  return (
    <>
      {showDischarged ? (
        <DischargedPatients onClose={() => setShowDischarged(false)} />
      ) : (
        <div className="min-h-screen p-3 sm:p-4 md:p-6">
          {isFetching && <div className="p-4 text-center text-sm">Refreshing....</div>}
          <div className="max-w-full mx-auto space-y-4 md:space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
                  <BedDouble className="w-6 h-6 md:w-8 md:h-8 text-purple-600 flex-shrink-0" />
                  Inpatient Department
                </h1>
                <p className="text-slate-500 mt-1 text-sm md:text-base">Manage admitted patients and bed allocation</p>
              </div>
              <div className="flex items-center gap-2 md:gap-3 self-start sm:self-auto">
                <button
                  onClick={() => refetch()}
                  className="px-3 py-2 md:px-4 md:py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition flex items-center gap-2 shadow-sm text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button className="px-3 py-2 md:px-4 md:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 shadow-sm text-sm">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>

            {/* Stats Cards — 2 cols on mobile, 3 on tablet, 5 on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              <div className="dark:bg-slate-800 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium mb-1">Total Admitted</p>
                    <p className="text-2xl md:text-3xl font-bold">{totalAdmitted}</p>
                  </div>
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <Users className="w-5 h-5 md:w-7 md:h-7 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium mb-1">Total Beds</p>
                    <p className="text-2xl md:text-3xl font-bold">{totalBeds}</p>
                    <p className="text-xs text-slate-500 mt-1 md:mt-2">All wards</p>
                  </div>
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <Bed className="w-5 h-5 md:w-7 md:h-7 text-slate-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-xs md:text-sm font-medium mb-1">Occupied</p>
                    <p className="text-2xl md:text-3xl font-bold text-amber-600">{occupiedBeds}</p>
                    <p className="text-xs text-slate-500 mt-1 md:mt-2">Currently in use</p>
                  </div>
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <UserCheck className="w-5 h-5 md:w-7 md:h-7 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-xs md:text-sm font-medium mb-1">Available</p>
                    <p className="text-2xl md:text-3xl font-bold text-emerald-600">{availableBeds}</p>
                    <p className="text-xs text-slate-500 mt-1 md:mt-2">Ready for use</p>
                  </div>
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <BedDouble className="w-5 h-5 md:w-7 md:h-7 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Occupancy spans full width on mobile (2-col), auto on others */}
              <div className="col-span-2 md:col-span-3 lg:col-span-1 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all group text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs md:text-sm font-medium mb-1">Occupancy Rate</p>
                    <p className="text-2xl md:text-3xl font-bold">{occupancyRate}%</p>
                    <p className="text-xs text-purple-200 mt-1 md:mt-2">Current capacity</p>
                  </div>
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <BarChart3 className="w-5 h-5 md:w-7 md:h-7" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar — wraps on tablet */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 p-3 md:p-4">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <button
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition shadow-md font-medium text-sm"
                  onClick={() => setShowDischarged(true)}
                >
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span>Discharged Patients</span>
                </button>

                <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-md font-medium text-sm">
                  <Bed className="w-4 h-4 flex-shrink-0" />
                  <span>Bed Status</span>
                </button>

                <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg bg-slate-50 transition font-medium text-sm">
                  <Clipboard className="w-4 h-4 flex-shrink-0" />
                  <span>Discharge Queue</span>
                </button>

                {/* Search — full width on its own row on mobile/tablet, inline on desktop */}
                <div className="w-full md:flex-1 md:max-w-none lg:flex-1 lg:max-w-md mt-1 md:mt-0 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, MR No., IP No..."
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Ward Filter Tabs — scrollable row */}
            <div className="bg-white rounded-xl shadow-lg border dark:bg-slate-800 border-slate-200 p-3 md:p-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {wards.map((ward: any) => (
                  <button
                    key={ward}
                    onClick={() => setSelectedWard(ward)}
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${
                      selectedWard === ward
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {ward === 'all' ? 'All Wards' : ward}
                  </button>
                ))}
              </div>
            </div>

            {/* Patients Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="w-full overflow-x-auto">
                <table className="min-w-[640px] w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                      {[
                        { key: 'action', label: 'Action' },
                        { key: 'mrNo', label: 'MR No.' },
                        { key: 'ipNo', label: 'IP No.' },
                        { key: 'name', label: 'Patient Info' },
                        { key: 'contact', label: 'Contact Info' },
                        { key: 'admitDate', label: 'Admission Date' },
                        { key: 'ward', label: 'Ward' },
                        { key: 'bedNo', label: 'Bed' },
                        { key: 'report', label: 'Report' },
                      ].map((column, index) => (
                        <th
                          key={column.key}
                          className={`
                            px-3 md:px-4 py-3 md:py-4 text-left text-xs font-semibold uppercase tracking-wider
                            ${index === 0 ? 'sticky left-0 bg-purple-700 z-30' : ''}
                            ${column.key === 'ipNo' ? 'hidden xl:table-cell' : ''}
                            ${column.key === 'contact' ? 'hidden xl:table-cell' : ''}
                            ${column.key === 'report' ? 'hidden xl:table-cell' : ''}
                            ${index !== 0 ? 'border-l border-purple-500' : ''}
                          `}
                        >
                          <div className="flex items-center justify-between gap-1 md:gap-2">
                            <span>{column.label}</span>
                            {column.key !== 'action' && (
                              <button
                                onClick={() => handleSort(column.key?.toString() ?? '')}
                                className="hover:bg-purple-500/30 p-1 rounded transition flex-shrink-0"
                              >
                                <ArrowUpDown className="w-3 h-3 md:w-4 md:h-4 opacity-70 hover:opacity-100" />
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {inPatients.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                          <Bed className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No admitted patients found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map((patient: inPatientResponse, idx: any) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          {/* Sticky Actions Column */}
                          <td className="px-2 md:px-3 py-3 sticky left-0 bg-white dark:bg-slate-800 z-10">
                            <div
                              className="flex items-center gap-1"
                              onClick={() => openConsultantNotes(patient)}
                            >
                              <button className="p-1.5 md:p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition">
                                <FileText className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                              </button>
                            </div>
                          </td>

                          {/* MR No. — Always Visible */}
                          <td className="px-2 md:px-4 py-3 whitespace-nowrap">
                            <p className="font-mono text-xs md:text-sm font-semibold text-slate-700">
                              {patient.PatientCode}
                            </p>
                          </td>

                          {/* IPD Code — Hidden until xl */}
                          <td className="px-2 md:px-4 py-3 hidden xl:table-cell whitespace-nowrap">
                            <p className="font-mono text-sm text-slate-500">
                              {patient.IPDCODE}
                            </p>
                          </td>

                          {/* Name + Age — Always Visible */}
                          <td className="px-2 md:px-4 py-3">
                            <div className="flex flex-col">
                              <p className="font-semibold text-sm md:text-base whitespace-nowrap">
                                {patient.patientname}
                              </p>
                              <p className="text-xs md:text-sm text-slate-500">
                                {patient.Age}
                              </p>
                            </div>
                          </td>

                          {/* Contact — Hidden until xl */}
                          <td className="px-2 md:px-4 py-3 hidden xl:table-cell">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <p className="text-sm text-slate-700 whitespace-nowrap">
                                  {patient.Mobile}
                                </p>
                              </div>
                              <div className="flex items-start gap-1 max-w-[200px]">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-slate-700 truncate">
                                  {patient.ADDRESS}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Admit Date — Always Visible */}
                          <td className="px-2 md:px-4 py-3 whitespace-nowrap">
                            <span className="text-xs md:text-sm text-slate-700">
                              {new Date(patient.AdmitDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </td>

                          {/* Ward — Always Visible */}
                          <td className="px-2 md:px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1 md:gap-2">
                              <Home className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span
                                className={`text-xs md:text-sm font-medium ${
                                  patient.ward === "ICU"
                                    ? "text-red-600"
                                    : "text-slate-700"
                                }`}
                              >
                                {patient.ward}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {patient.wardName}
                            </p>
                          </td>

                          {/* Bed — Always Visible */}
                          <td className="px-2 md:px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1 md:gap-2">
                              <Bed className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                              <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-purple-100 text-purple-700 rounded-md text-xs md:text-sm font-semibold">
                                {patient.bedno}
                              </span>
                            </div>
                          </td>

                          {/* Reporting Dept — Hidden until xl */}
                          <td className="px-2 md:px-4 py-3 hidden xl:table-cell">
                            <div className="flex items-start gap-1 max-w-[180px]">
                              <Activity className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-slate-700 truncate">
                                {patient.Gphreporting}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 px-4 md:px-6 py-4 rounded-xl shadow-lg border border-slate-200">
              <p className="text-xs md:text-sm text-slate-600">
                Showing <span className="font-semibold">1-{inPatients.length}</span> of{' '}
                <span className="font-semibold">{totalAdmitted}</span> admitted patients
              </p>
              <div className="flex gap-1.5 md:gap-2 flex-wrap">
                <button className="px-3 py-1.5 md:px-4 md:py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                  Previous
                </button>
                <button className="px-3 py-1.5 md:px-4 md:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm">
                  1
                </button>
                <button className="px-3 py-1.5 md:px-4 md:py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm">
                  2
                </button>
                <button className="px-3 py-1.5 md:px-4 md:py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm">
                  Next
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default IPDDashboard;