'use client';
import React, { useState } from "react";
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

  const { data, isFetching } = useDischargedPatients(authToken, appliedFilters);

  const dischargedPatients = data?.data ?? [];

  // Handle input changes
  const handleFilterChange = (field: string, value: string) => {
    
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Apply filters
  const handleShowResults = () => {
    console.log(filters);
    setAppliedFilters(filters);
  }
  console.log(appliedFilters);

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
                onClick={handleShowResults}
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

          {/* Discharged Patients Table */}
          <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="max-w-full">
                <thead className="sticky top-0 w-full bg-slate-100 border-b">
                  <tr className="text-left text-slate-700">
                    <th className="px-6 py-4">IPD Code</th>
                    <th className="px-6 py-4">Patient Info</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Ward</th>
                    <th className="px-6 py-4">Consultant</th>
                    <th className="px-6 py-4">Admission Date</th>
                    <th className="px-6 py-4">Discharge Date</th>
                    <th className="px-6 py-4">StayDays</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {dischargedPatients.length > 0 ? (
                    dischargedPatients.map((patient: dischargedPatientResponse, index: number) => (
                      <tr key={index} 
                      onClick={()=> openConsultantNotes(patient)}
                      className="hover:bg-blue-50">
                        <td className="px-6 py-4 text-sm font-semibold">IPD{patient.IPDCODE || "N/A"} / {patient.Mrno}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{patient.PATIENTNAME || "N/A"}</div>
                          <div className="text-slate-500 text-xs">{patient.Age || "N/A"} Years</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" /> {patient.Mobile || "N/A"}
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 mt-1">
                            <MapPin className="w-3.5 h-3.5" /> {patient.ADDRESS || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                            <Bed className="w-3.5 h-3.5" /> {patient.WARD || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-sm text-purple-700 rounded-full">
                            <Stethoscope className="w-3.5 h-3.5" /> {patient.CONSULTANT || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4"> 
                        <div className="font-medium">{patient.ADMITTEDTIME_E || "N/A"}</div>
                         <div className="text-xs text-slate-500">{patient.ADMITTEDTIME_N || "N/A"}</div> 
                        </td> 
                        <td className="px-6 py-4"> 
                          <div className="font-medium">{patient.DISCHARGEDATE_E || "N/A"}</div> 
                          <div className="text-xs text-slate-500">{patient.DISCHARGEDATE_N || "N/A"}</div> 
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                            <Clock className="w-3.5 h-3.5" /> {patient.STAYDAYS || "N/A"} Days
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                        No discharged patients found. Adjust filters and click "Show Results".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default DischargedPatients;
