"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Users,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  Check,
  RefreshCw,
  Download,
  FileText,
  User,
  Phone,
  MapPin,
  Clock,
  ChevronRight,
  X,
  Building2,
} from "lucide-react";
import { useAuthToken } from "@/context/AuthContext";
import { useOPDPatients } from "@/queries/opd.queries";
import { useRouter } from "next/navigation";
import { useFacultyMaster } from "@/queries/master.queries";
import { opdPatientRequest } from "@/types/patient.type";

const DATE_OPTIONS = [
  "Today",
  "Yesterday",
  "This Week",
  "Previous Week",
  "This Month",
  "Previous Month",
  "Custom",
];

interface OPDALLPatientsProps {
  onClose: () => void;
}

const OPDALLPatients: React.FC<OPDALLPatientsProps> = ({ onClose }) => {
  const { authToken } = useAuthToken();
  const router = useRouter();

  // Filter States
  const [dateFilter, setDateFilter] = useState("Today");
  const [dateOpen, setDateOpen] = useState(false);
  const [customDate, setCustomDate] = useState({ from: "", to: "" });
  const dateRef = useRef<HTMLDivElement | null>(null);

  const [selectedFaculty, setSelectedFaculty] = useState(""); // faculty code as string
  const [facultyOpen, setFacultyOpen] = useState(false);
  const facultyRef = useRef<HTMLDivElement | null>(null);

  const [searchName, setSearchName] = useState("");
  const [searchMRNo, setSearchMRNo] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  const { data: facultyMaster, isLoading: isFacultyLoading } = useFacultyMaster(authToken);

  // Store filters in state for query function
  const [filters, setFilters] = useState<opdPatientRequest>({
    deptcode: 0,
    centerid: 1,
    showall: "1",
    date: null,
    datefrom: null,
    dateTo: null,
    PATIENTNAME: "",
    MRNO: "",
  });

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dateRef.current?.contains(e.target as Node)) setDateOpen(false);
      if (!facultyRef.current?.contains(e.target as Node)) setFacultyOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Calculate date range based on filter
  const getDateRange = () => {
    const today = new Date();
    let fromDate = "";
    let toDate = "";

    switch (dateFilter) {
      case "Today":
        fromDate = toDate = today.toISOString().split("T")[0];
        break;
      case "Yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        fromDate = toDate = yesterday.toISOString().split("T")[0];
        break;
      case "This Week":
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        fromDate = startOfWeek.toISOString().split("T")[0];
        toDate = today.toISOString().split("T")[0];
        break;
      case "Previous Week":
        const prevWeekEnd = new Date(today);
        prevWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        const prevWeekStart = new Date(prevWeekEnd);
        prevWeekStart.setDate(prevWeekEnd.getDate() - 6);
        fromDate = prevWeekStart.toISOString().split("T")[0];
        toDate = prevWeekEnd.toISOString().split("T")[0];
        break;
      case "This Month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        fromDate = startOfMonth.toISOString().split("T")[0];
        toDate = today.toISOString().split("T")[0];
        break;
      case "Previous Month":
        const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        fromDate = prevMonthStart.toISOString().split("T")[0];
        toDate = prevMonthEnd.toISOString().split("T")[0];
        break;
      case "Custom":
        fromDate = customDate.from;
        toDate = customDate.to;
        break;
      default:
        fromDate = toDate = today.toISOString().split("T")[0];
    }

    return { fromDate, toDate };
  };

  const { fromDate, toDate } = getDateRange();



  // Fetch OPD Patients (disabled initially)
  const { data: patients = [], isLoading } = useOPDPatients(authToken, filters);
  console.log("Patients",patients)

  // Handle search / filter apply
  const handleSearch = () => {
    if (!authToken) return;

    setFilters({
      deptcode: selectedFaculty ? parseInt(selectedFaculty) : 0,
      centerid: 1,
      showall: selectedFaculty ? "1" : "0", // 0 if filtering, 1 if show all
      date: null,   // pass null, not empty string
      datefrom: fromDate || null,
      dateTo: toDate || null,
      PATIENTNAME: searchName,
      MRNO: searchMRNo,
    });

  };

  const handleClearFilters = () => {
    setSearchName("");
    setSearchMRNo("");
    setDateFilter("Today");
    setCustomDate({ from: "", to: "" });
    setSelectedFaculty("");
    setFilters({
      deptcode: 0,
      centerid: 1,
      showall: "1",
      date: "",
      datefrom: "",
      dateTo: "",
      PATIENTNAME: "",
      MRNO: "",
    });
  };


  const openConsultantNotes = (Patient: any) => {
    sessionStorage.setItem('selectedPatient', JSON.stringify(Patient));
    const faculty = Patient.FacultyName;

    if (faculty === 'E N T') {
      router.push(`/consultant-notes/ent/${Patient.PatientCode}`); 
    } else {
      router.push(`/consultant-notes/${Patient.PatientCode}`); 
    }
  };

  // Safe function to get selected faculty label
  const getSelectedFacultyLabel = () => {
    if (!facultyMaster || facultyMaster.length === 0) return "All Faculties";
    const faculty = facultyMaster.find((f: any) => f.Code.toString() === selectedFaculty);
    return faculty?.label || "All Faculties";
  };

  // Statistics
  const stats = {
    total: patients.length,
    newVisits: patients.filter((p: any) => p.VisitMode?.includes("New")).length,
    followUps: patients.filter((p: any) => p.VisitMode?.includes("Follow Up")).length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
    
      <div className="px-6 py-6">
        {/* Header & Statistics */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">All OPD Patients</h1>
                <p className="text-sm ">
                  Comprehensive patient records and management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className=" rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1">Total Patients</p>
                  <p className="text-3xl font-bold ">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className=" rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm  font-medium mb-1">New Visits</p>
                  <p className="text-3xl font-bold text-green-600">{stats.newVisits}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <User className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className=" rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm  font-medium mb-1">Follow-ups</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.followUps}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <RefreshCw className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className=" rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                <h3 className="font-semibold">Search & Filters</h3>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>

            {showFilters && (
              <>
                {/* Faculty Dropdown */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Select Faculty / Department
                  </label>
                  <div ref={facultyRef} className="relative">
                    <button
                      onClick={() => setFacultyOpen((p) => !p)}
                      className="flex items-center justify-between w-full px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-600">Faculty:</span>
                        <span className="font-medium text-gray-900">{getSelectedFacultyLabel()}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    {facultyOpen && (
                      <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50 max-h-96 overflow-y-auto">
                        {facultyMaster?.map((faculty: any) => (
                          <button
                            key={faculty.Code}
                            onClick={() => {
                              setSelectedFaculty(faculty.Code.toString());
                              setFacultyOpen(false);
                            }}
                            className="flex w-full justify-between items-center px-3 py-2.5 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <span className="text-gray-700">{faculty.label}</span>
                            {selectedFaculty === faculty.Code.toString() && (
                              <Check className="w-4 h-4 text-blue-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Search Inputs */}
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by patient name..."
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by MR Number..."
                      value={searchMRNo}
                      onChange={(e) => setSearchMRNo(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Date Filter */}
                <div className="mb-4 flex items-center gap-4">
                  <div ref={dateRef} className="relative flex-1">
                    <button
                      onClick={() => setDateOpen((p) => !p)}
                      className="flex items-center justify-between w-full px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-600">Date Range:</span>
                        <span className="font-medium text-gray-900">{dateFilter}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    {dateOpen && (
                      <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50">
                        {DATE_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setDateFilter(opt)}
                            className="flex w-full justify-between items-center px-3 py-2.5 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <span className="text-gray-700">{opt}</span>
                            {dateFilter === opt && <Check className="w-4 h-4 text-blue-600" />}
                          </button>
                        ))}

                        {dateFilter === "Custom" && (
                          <div className="border-t border-gray-200 mt-2 pt-3 space-y-3">
                            <div>
                              <label className="text-xs text-gray-600 mb-1.5 block font-medium">
                                From Date
                              </label>
                              <input
                                type="date"
                                value={customDate.from}
                                onChange={(e) => setCustomDate({ ...customDate, from: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 mb-1.5 block font-medium">
                                To Date
                              </label>
                              <input
                                type="date"
                                value={customDate.to}
                                onChange={(e) => setCustomDate({ ...customDate, to: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                            </div>
                            <button
                              onClick={() => {
                                setDateOpen(false);
                                handleSearch();
                              }}
                              disabled={!customDate.from || !customDate.to}
                              className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                            >
                              Apply Custom Range
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSearch}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Clear
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          {patients.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium">No patients found.</div>
          ) : (
            <table className="w-full table-auto border-collapse text-left">
              <thead className="bg-blue-600 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-white">Actions</th>
                  <th className="px-4 py-3 text-sm font-medium text-white">MR No</th>
                  <th className="px-4 py-3 text-sm font-medium text-white">Patient Code</th>
                  <th className="px-4 py-3 text-sm font-medium text-white">Patient Name</th>
                  <th className="px-4 py-3 text-sm font-medium text-white">Age</th>
                  <th className="px-4 py-3 text-sm font-medium text-white">Contact</th>
                  <th className="px-4 py-3 text-sm font-medium text-white">Blocked By</th>
                  <th className="px-4 py-3 text-sm font-medium text-white">Visit Mode</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p: any, idx: number) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 cursor-pointer dark:hover:text-black"
                    onClick={() => openConsultantNotes(p)}
                  >
                    <td className="px-4 py-3 text-sm ">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openConsultantNotes(p);
                        }}
                        className="text-blue-600 font-medium text-normal flex flex-row-reverse items-center justify-center gap-1.5 transition-all ease-in-out hover:scale-105"
                      >
                        <ChevronRight size={16} />
                        View
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm ">{p.RegCode}</td>
                    <td className="px-4 py-3 text-sm ">{p.PatientCode}</td>
                    <td className="px-4 py-3 text-sm ">{p.PATIENTNAME}</td>
                    <td className="px-4 py-3 text-sm ">{p.Age}</td>
                    <div className="flex flex-col">
                      <td className="text-sm ">{p.ADDRESS}</td>
                      <td className="px-4 py-3 text-sm">{p.Mobile}</td>
                    </div>
                    <td className="px-4 py-3 text-sm ">{p.BlockedBy}</td>
                    <td className="px-4 py-3 text-sm ">{p.VisitMode}</td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default OPDALLPatients;
