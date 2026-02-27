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
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuthToken } from "@/context/AuthContext";
import { useDischargedPatients } from "@/queries/discharged.queries";
import { dischargedPatientResponse } from "@/types/patient.type";
import { ThreeDots } from "react-loader-spinner";
import { useRouter } from "next/navigation";
import { AutoSizer, Table, Column } from 'react-virtualized';
import 'react-virtualized/styles.css';

interface DischargedPatientsProps {
  onClose: () => void;
}

const DischargedPatients: React.FC<DischargedPatientsProps> = ({ onClose }) => {
  const { authToken } = useAuthToken();

  const router = useRouter();

  // Filters state
  const [filters, setFilters] = useState({
    DTFROM: "",
    dtto: "",
    centercode: "1",
    patientname: "",
    mrno: ""
  });

  // Applied filters for query
  const [appliedFilters, setAppliedFilters] = useState(filters);

  useEffect(() => {
    const timeout = setTimeout(() => setAppliedFilters(filters), 300);
    return () => clearTimeout(timeout);
  }, [filters]);

  const { data, isFetching } = useDischargedPatients(authToken, appliedFilters);

  const dischargedPatients = data?.data ?? [];

  // Handle input changes
  const handleFilterChange = (field: string, value: string) => {
    
    setFilters(prev => ({ ...prev, [field]: value }));
  };


  // Reset filters
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

  const openConsultantNotes = (Patient:any) => {
    sessionStorage.setItem('selectedPatietnt', JSON.stringify(Patient));
    router.push(`/consultant-notes/${Patient.Mrno}`);
  }

  // Define this once, reuse it in both header and rowRenderer
  const gridClass = "grid w-full grid-cols-[1fr_1.5fr_1.8fr_1fr_1.3fr_1.4fr_1.4fr_0.8fr] items-center";

  const rowRenderer = ({ index, key, style }: any) => {
    const patient = dischargedPatients[index];
    if (!patient) return null;

    return (
      <div
        key={key}
        style={style}
        className={`${gridClass} border-b cursor-pointer hover:bg-blue-50 text-sm`}
        onClick={() => openConsultantNotes(patient)}
      >
        <div className="px-4 font-semibold text-sm">IPD{patient.IPDCODE || "N/A"} / {patient.Mrno}</div>
        <div className="px-4">
          <div className="font-semibold text-slate-800 text-lg">{patient.PATIENTNAME || "N/A"}</div>
          <div className="text-m text-slate-500">{patient.Age || "N/A"} Years</div>
        </div>
        <div className="px-4 flex flex-col gap-1">
          <span className="flex gap-1 items-center"><Phone className="w-3 h-3 shrink-0" /> {patient.Mobile || "N/A"}</span>
          <span className="flex gap-1 items-center text-xs text-slate-500"><MapPin className="w-3 h-3 shrink-0" /> {patient.ADDRESS || "N/A"}</span>
        </div>
        <div className="px-4 flex gap-1 items-center"><Bed className="w-4 h-4 shrink-0" /> {patient.WARD || "N/A"}</div>
        <div className="px-4 flex gap-1 items-center"><Stethoscope className="w-4 h-4 shrink-0" /> {patient.CONSULTANT || "N/A"}</div>
        <div className="px-4 flex gap-1 items-center">
          <Calendar className="w-4 h-4 shrink-0" /> {patient.ADMITTEDTIME_E || "N/A"} / {patient.ADMITTEDTIME_N || "N/A"}
        </div>
        <div className="px-4 flex gap-1 items-center">
          <Calendar className="w-4 h-4 shrink-0" /> {patient.DISCHARGEDATE_E || "N/A"} / {patient.DISCHARGEDATE_N || "N/A"}
        </div>
        <div className="px-4 flex gap-1 items-center"><Clock className="w-4 h-4 shrink-0" /> {patient.STAYDAYS || "N/A"}</div>
      </div>
    );
  };

  return (
    <>
      {isFetching && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-9">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <ThreeDots
              height="80"
              width="80"
              radius="9"
              color="#4fa94d"
              ariaLabel="three-dots-loading"
              wrapperStyle={{ margin: '20px' }}
              wrapperClass="custom-loader"
              visible={true}
            />
          </div>
        </div>
      )}

      <div className="min-h-screen p-6">
        <div className="max-w-full mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Discharged Patients</h1>
              <p className="text-slate-600">List of patients discharged within selected date range</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Close
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Search Filters
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Discharge Date From */}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Discharge Date From</label>
                <DatePicker
                  selected={filters.DTFROM ? new Date(filters.DTFROM) : null}
                  onChange={(date:any) => handleFilterChange("DTFROM", date ? date.toISOString().split('T')[0] : '')}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select date"
                />
              </div>

              {/* Discharge Date To */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Discharge Date To</label>
                <DatePicker
                  selected={filters.dtto ? new Date(filters.dtto) : null}
                  onChange={(date:any) => handleFilterChange("dtto", date ? date.toISOString().split('T')[0] : '')}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select date"
                />
              </div>

              {/* MR Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">MR Number</label>
                <input
                  type="text"
                  value={filters.mrno}
                  onChange={e => handleFilterChange("mrno", e.target.value)}
                  placeholder="Enter MR Number"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Patient Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Patient Name</label>
                <input
                  type="text"
                  value={filters.patientname}
                  onChange={e => handleFilterChange("patientname", e.target.value)}
                  placeholder="Enter Patient Name"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setAppliedFilters(filters)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Search className="w-4 h-4" /> Show Results
              </button>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Applied Filters Display */}
          {(appliedFilters.DTFROM || appliedFilters.dtto) && (
            <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3 text-slate-700">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Discharged From:</span>
                <span className="text-slate-600">{appliedFilters.DTFROM || "Not Set"}</span>
                <span className="mx-2">→</span>
                <span className="font-semibold">To:</span>
                <span className="text-slate-600">{appliedFilters.dtto || "Not Set"}</span>
              </div>

              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-600 text-white rounded-xl p-5 shadow">
              <div className="text-3xl font-bold">{dischargedPatients.length}</div>
              <div className="text-blue-100 text-sm">Total Discharged</div>
            </div>
            <div className="bg-emerald-600 text-white rounded-xl p-5 shadow">
              <div className="text-3xl font-bold">6</div>
              <div className="text-emerald-100 text-sm">Avg Stay (Days)</div>
            </div>
            <div className="bg-purple-600 text-white rounded-xl p-5 shadow">
              <div className="text-3xl font-bold">12</div>
              <div className="text-purple-100 text-sm">Wards Covered</div>
            </div>
          </div>

          {/* Virtualized Patient Table */}
         <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
            {/* Sticky Header */}
            <div className={`${gridClass} bg-blue-600 text-white font-semibold text-lg`}>
              <div className="px-4 py-2">IPD Code</div>
              <div className="px-4 py-2">Patient Info</div>
              <div className="px-4 py-2">Contact</div>
              <div className="px-4 py-2">Ward</div>
              <div className="px-4 py-2">Consultant</div>
              <div className="px-4 py-2">Admission Date</div>
              <div className="px-4 py-2">Discharge Date</div>
              <div className="px-4 py-2">Stay Days</div>
            </div>

            <div style={{ height: 600 }}>
              <AutoSizer>
                {({ width, height }) => (
                  <Table
                    width={width}
                    height={height}
                    headerHeight={0} // we’re handling our own header
                    rowHeight={80}
                    rowCount={dischargedPatients.length}
                    rowGetter={({ index }) => dischargedPatients[index]}
                    overscanRowCount={5}
                    rowRenderer={rowRenderer}
                  />
                )}
              </AutoSizer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DischargedPatients;
