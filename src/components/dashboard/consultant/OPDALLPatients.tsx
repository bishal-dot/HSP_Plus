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
  Stethoscope,
} from "lucide-react";
import { useAuthToken } from "@/context/AuthContext";
import { useOPDPatients } from "@/queries/opd.queries";
import { useRouter } from "next/navigation";
import { useFacultyMaster } from "@/queries/master.queries";
import { opdPatientRequest } from "@/types/patient.type";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { RotatingLines } from "react-loader-spinner";
import { AutoSizer, List } from "react-virtualized";

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

  const Loader = () => {
      return(<RotatingLines
        strokeColor="grey"
        strokeWidth="5"
        animationDuration="0.75"
        width="96"
        visible={true}
      />)
    }

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
      router.push(`/consultant-notes/${Patient.PatientCode}`); 
  };

  const gridClass = "grid w-full grid-cols-1 md:grid-cols-[1fr_1fr_1.5fr_1.8fr_2fr_1.3fr] items-center";

  const rowRenderer = ({ rowData, index, key, style }: any) => {
    const patient = patients[index];
    if (!patient) return null;

    return (
      <div
        key={key}
        style={style}
        className={`${gridClass} border-b border-slate-100 hover:bg-blue-50/60 dark:hover:bg-slate-700/40 transition-colors text-left text-sm group cursor-pointer`}
        onClick={() => openConsultantNotes(rowData)}>

        {/* Actions */}
        <div className="flex items-start gap-0.5 px-1">
          <button className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition">
            <FileText className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* IPD / MR */}
        <div className="px-3">
          <p className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
            {patient.RegCode|| "N/A"}
          </p>
          <p className="font-mono text-sm text-slate-400">{patient.PatientCode}</p>
        </div>

        {/* Patient info */}
        <div className="px-3">
          <p className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">
            {patient.PATIENTNAME}
          </p>
          <p className="font-mono text-sm text-slate-400">{patient.Age}</p>
        </div>
        
        {/* Contact */}
          <div className="px-3 flex flex-col gap-0.5">
            <span className="flex gap-1 items-start text-sm text-slate-700 dark:text-slate-300">
              <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {patient.Mobile || "N/A"}
            </span>
            <span className="flex gap-1 items-start text-sm text-slate-500 truncate">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {patient.ADDRESS || "N/A"}
            </span>
          </div>

          {/* Consultant */}
        <div className="px-3 flex gap-1 items-start text-sm text-slate-700 dark:text-slate-300">
          <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{patient.BlockedBy || "N/A"}</span>
        </div>

        {/* Visit Mode */}
        <div className="px-3">
          <p className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">
            {patient.VisitMode}
          </p>
        </div>
      </div>
    )
  }

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
             <Loader />
          {/* <p className="text-slate-600 font-medium">Loading patients...</p> */}
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
                              <DatePicker
                                  selected={customDate.from ? new Date(customDate.from) : null}
                                  onChange={(date: any) => setCustomDate(prev => ({ ...prev, from: date ? date.toISOString().split('T')[0] : "" }))}
                                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                  dateFormat="yyyy-MM-dd"
                                  placeholderText="Select date"
                                />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 mb-1.5 block font-medium">
                                To Date
                              </label>
                              <DatePicker
                                selected={customDate.to ? new Date(customDate.to) : null}
                                onChange={(date: any) => setCustomDate(prev => ({ ...prev, to: date ? date.toISOString().split('T')[0] : "" }))}
                                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                dateFormat="yyyy-MM-dd"
                                placeholderText="Select date"
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
        {/* <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
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
        </div> */}

        {/* ── Virtualized Table ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          {/* Sticky header */}
          <div className={`${gridClass} bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-semibold uppercase tracking-wide`}>
            <div className="px-2 py-3.5">Action.</div>
            <div className="px-3 py-3.5">MR No</div>
            <div className="px-3 py-3.5">Patient Info</div>
            <div className="px-3 py-3.5">Contact</div>
            <div className="px-3 py-3.5">Blocked By</div>
            <div className="px-3 py-3.5">Visit Mode</div>
          </div>

          {patients.length === 0 ? (
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
                    rowCount={patients.length}
                    // rowGetter={({ index }) => dischargedPatients[index]}
                    overscanRowCount={5}
                      rowRenderer={({ index, key, style }) =>
                      rowRenderer({ rowData: patients[index], index, key, style })
                    }
                  />
                )}
              </AutoSizer>
            </div>
          )}

          {/* Footer */}
          {patients.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{patients.length}</span> patients found
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Updated {new Date().toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OPDALLPatients;
