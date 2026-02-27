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

  // if(isLoading) return <div className="p-10 text-center">Loading IPD patients....</div>;

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const totalAdmitted = inPatients.length;

  const totalBeds = inPatients.reduce((sum:number, p:inPatientResponse) => {
    return sum + 1;
  },0);

  const occupiedBeds = inPatients.filter((p:inPatientResponse) => p.bedno && p.bedno !== '').length;

  const availableBeds = totalBeds - occupiedBeds;

  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

// filter wards
const wards = ['all', ...Array.from(new Set(inPatients.map((p:inPatientResponse) => p.wardName).filter(Boolean)))];

// filter patients based on selected ward
const filteredPatients = selectedWard === 'all' ? inPatients : inPatients.filter((p:inPatientResponse) => p.wardName === selectedWard);

  return (
    <>
    { showDischarged ? (
      <DischargedPatients onClose={() => setShowDischarged(false)} />
    ) : (
      <div className="min-h-screen  p-6">
      {isFetching && <div className="p-10 text-center">Refreshing....</div>}
      <div className="max-w-full mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BedDouble className="w-8 h-8 text-purple-600" />
              Inpatient Department
            </h1>
            <p className="text-slate-500 mt-1">Manage admitted patients and bed allocation</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 shadow-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1">Total Admitted</p>
                <p className="text-3xl font-bold ">{totalAdmitted}</p>
               
              </div>
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className=" text-sm font-medium mb-1">Total Beds</p>
                <p className="text-3xl font-bold">{totalBeds}</p>
                <p className="text-xs text-slate-500 mt-2">All wards</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bed className="w-7 h-7 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Occupied</p>
                <p className="text-3xl font-bold text-amber-600">{occupiedBeds}</p>
                <p className="text-xs text-slate-500 mt-2">Currently in use</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserCheck className="w-7 h-7 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Available</p>
                <p className="text-3xl font-bold text-emerald-600">{availableBeds}</p>
                <p className="text-xs text-slate-500 mt-2">Ready for use</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BedDouble className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Occupancy Rate</p>
                <p className="text-3xl font-bold">{occupancyRate}%</p>
                <p className="text-xs text-purple-200 mt-2">Current capacity</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 p-4">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition shadow-md font-medium"
            onClick={() => setShowDischarged(true)}
            >
              <Users className="w-4 h-4"   />
              Show All Discharged Patients
            </button>
          
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-md font-medium">
              <Bed className="w-4 h-4" />
              Bed Status
            </button>

            <button className="flex items-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg bg-slate-50 transition font-medium">
              <Clipboard className="w-4 h-4" />
              Discharge Queue
            </button>

            <div className="flex-1" />

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, MR No., IP No..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Ward Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg border dark:bg-slate-800 border-slate-200 p-4">
          <div className="flex items-center gap-2">
            {wards.map((ward:any) => (   
              <button 
                key={ward}
                onClick={() => setSelectedWard(ward)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
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
          <div className="overflow-x-auto">
            <table className="w-full">
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
                    {Key: 'report', label: 'Report'},
                  
                  ].map((column, index) => (
                    <th 
                      key={column.key}
                      className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                        index !== 0 ? 'border-l border-purple-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{column.label}</span>
                        {column.key !== 'action' && (
                          <button 
                            onClick={() => handleSort(column.key?.toString() ?? '')}
                            className="hover:bg-purple-500/30 p-1 rounded transition"
                          >
                            <ArrowUpDown className="w-4 h-4 opacity-70 hover:opacity-100" />
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
                    <td colSpan={11} className="px-4 py-12 text-center text-slate-400">
                      <Bed className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No admitted patients found</p>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient:inPatientResponse, idx:any) => (
                    <tr 
                      key={idx}
                      className="dark:hover:bg-blue-50 transition-colors group"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2"
                        // onClick={() => {
                        //   const patientData = patient; // your selected IPD patient
                        //   sessionStorage.setItem("selectedPatient", JSON.stringify(patientData));
                        //   router.push(`/ssd-estimate/${patient.PatientCode}/${patient.IPDCODE}`);
                        // }}
                        onClick={() => openConsultantNotes(patient)}
                        >
                          <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition group-hover:scale-110">
                            <FileText className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition group-hover:scale-110">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-mono text-sm text-slate-700 font-semibold">{patient.PatientCode}</p>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2"> 
                          <p className="font-mono text-m text-slate-500">{patient.IPDCODE}</p>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          
                          <div className='flex flex-col'>
                            <p className="font-semibold ">{patient.patientname}</p>
                            <p className='text-m dark:text-slate-200'>{patient.Age}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <p className="text-sm text-slate-700">{patient.Mobile}</p>
                          </div>
                          <div className="flex items-start gap-1 max-w-[200px]">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-slate-700 truncate">{patient.ADDRESS}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <span className="text-slate-700">
                              {new Date(patient.AdmitDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-slate-400" />
                          <span className={`text-sm font-medium ${
                            patient.ward === 'ICU' ? 'text-red-600' : 'text-slate-700'
                          }`}>
                            {patient.ward}
                          </span>
                        </div>
                        <p className="text-xs text-black mt-0.5">{patient.wardName}</p>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Bed className="w-4 h-4 text-purple-500" />
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">
                            {patient.bedno}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-1 max-w-[180px]">
                          <Activity className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-slate-700">{patient.Gphreporting}</p>
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
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-lg border border-slate-200">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold">1-{inPatients.length}</span> of <span className="font-semibold">{totalAdmitted}</span> admitted patients
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
              1
            </button>
            <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition">
              2
            </button>
            <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition">
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

export default IPDDashboard