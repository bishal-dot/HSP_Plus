'use client';

import React, { useState, useEffect, useRef} from 'react';
import {
  Users,
  ChevronRight,
  Download,
  RefreshCw,
  Stethoscope,
  ChevronLeft,
  MoreHorizontal,
  Filter,
  Calendar,
  ChevronDown,
  Check,
  Activity
} from 'lucide-react';
import { useAuthToken } from '@/context/AuthContext';
import { useOPDPatients, useOPDPatientsDayWise } from '@/queries/opd.queries';
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
  const { authToken, consultantCode, username, isConsultant } = useAuthToken(); // 
  const router = useRouter();

  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 100;

  const [show, setShow] = useState(false);
  const [showVitalModal, setIsVitalsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [ showAllPatients, setShowAllPatients ] = useState(false);

  const [dateFilter, setDateFilter] = useState('Today'); 
  const [dateOpen, setDateOpen] = useState(false);
  const [customDate, setCustomDate] = useState({ from: '', to: '' });
  const dateRef = useRef<HTMLDivElement | null>(null);

  // Close date dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dateRef.current?.contains(e.target as Node)) {
        setDateOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Calculate date range based on filter
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

    if (faculty === 'E N T') {
      router.push(`/consultant-notes/ent/${Patient.MRNo}`); 
    } else {
      router.push(`/consultant-notes/${Patient.MRNo}`); 
    }
  };

  // Get current date range
  const { fromDate, toDate } = getDateRange();

 
  const getToday = () => {
    const today = new Date();
    if (dateFilter === 'Yesterday') {
      today.setDate(today.getDate() - 1);
    }
    return today.toISOString().split('T')[0];
  };

  const selectedDate = getToday();

  const { data: opdPatientDayWise, isLoading, isFetching, refetch } = useOPDPatientsDayWise(authToken, {
    DTODAY: selectedDate,
    deptcode: 1,
    consultantcode: consultantCode,
    centerid: 1
  });


  const patients = opdPatientDayWise?.data ?? [];
  const totalPatients = patients.length; 

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 100000) return (num / 1000).toFixed(0) + 'k';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading OPD patients...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    {showAllPatients ? ( <OPDALLPatients onClose={() => setShowAllPatients(false)} /> ) : (
    <div className="min-h-screen max-w-full">
      {isFetching && (
        <div className="fixed top-4 right-4 z-50 bg-white px-4 py-3 rounded-lg shadow border border-blue-200 flex items-center gap-3">
          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
          <span className="text-sm font-medium">Refreshing...</span>
        </div>
      )}

      

      <div className="px-6 py-4">
        {/* Header */}
        <div className="flex justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">OPD Dashboard</h1>
              <p className="text-sm">
                {/* Show personalized message for consultants */}
                {isConsultant 
                  ? `Welcome ${username} - Your Patients Today`
                  : 'Real-time patient queue management'
                }
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="relative flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border rounded" 
                onClick={() => {
                  setShowAllPatients(true);
                }}
              >
                Show All Patients
              </button>
              <div 
               onClick={() => {
                    refetch();
                    setShow(false);
                  }} 
              className="border rounded-lg shadow p-2 flex flex-col gap-2 cursor-pointer hover:rotate-180">
                  <RefreshCw className="dark:text-white w-6 h-6" /> 
              </div>
          </div>
        </div>

        {/* Active Filter Display */}
        <div className="mb-4 flex items-center justify-between text-sm bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600">Showing results for:</span>
            <span className="font-medium text-blue-700">
              {fromDate === toDate 
                ? new Date(fromDate).toLocaleDateString()
                : `${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}`
              }
            </span>
          </div>
          {/*  Show consultant filter badge */}
          {isConsultant ? (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
              Your Patients Only (Code: {consultantCode})
            </span>
          ) : (
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
              All Patients (Admin View)
            </span>
          )}
        </div>

        {/* Table */}
        <div className="border rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white text-xs uppercase">
              <tr>
                <th className="px-6 py-4 text-left">Actions</th>
                <th className="px-6 py-4 text-left">Token</th>
                <th className="px-6 py-4 text-left">MR No.</th>
                <th className="px-6 py-4 text-left">Patient</th>
                <th className="px-6 py-4 text-left">Age/Gender</th>
                <th className="px-6 py-4 text-left">Contact</th>
                <th className="px-6 py-4 text-left">Faculty</th>
                <th className="px-6 py-4 text-left">Consultant</th>
                <th className="px-6 py-4 text-left">Check In</th>
                <th className="px-6 py-4 text-left">Wait Time</th>
              </tr>
            </thead>
            <tbody>
              {patients.length > 0 ? (
                patients.map((p: any, idx: number) => (
                  <tr key={idx} className="border-t hover:bg-slate-50 dark:hover:text-black">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openConsultantNotes(p)}
                        className="text-blue-600 flex items-center gap-1 hover:scale-105 transition-all ease-in-out font-medium"
                      >
                        View <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-6 py-4 font-medium text-sm">{p.TokenNo}</td>
                    <td className="px-6 py-4 text-sm">{p.MRNo}</td>
                    <td className="px-6 py-4 font-sm text-sm">{p.PatientName}</td>
                    <td className="px-6 py-4 text-sm">{p.Age}</td>
                    <td className="px-6 py-4 text-sm">{p.ContactNo}</td>
                    <td className="px-6 py-4 text-sm">{p.FacultyName}</td>
                    <td className="px-6 py-4 text-sm">{p.BlockedBy}</td>
                    <td className="px-6 py-4 text-sm">{p.CheckIn}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.WaitingTime}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">
                        {/*  Different message for consultant vs admin */}
                        {isConsultant 
                          ? 'No patients assigned to you for this date'
                          : 'No patients found for this date range'
                        }
                      </p>
                      <p className="text-sm text-gray-400">Try selecting a different date</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="px-6 py-4 bg-slate-50 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Total Patients: {formatNumber(totalPatients)}
            </span>
            <span className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
     )}
    </>
  );
};

export default OPDDashboard;