"use client";

import { useAuthToken } from "@/context/AuthContext";
import {
  FileText, AlertTriangle, CheckCircle2,
  FlaskConical, Calendar, TrendingUp, TrendingDown, Minus,
  Activity,
  Printer,
} from "lucide-react";
import { useLabRecords } from "../queries/labRecords.queries";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import PrintLayout from "@/components/ui/printLayout/printLayout";

interface props {
  Patientcode: string;
}

const LaboratoryRecords: React.FC<props> = ({ Patientcode }) => {
  const { authToken } = useAuthToken();

  const printRef = useRef<HTMLDivElement>(null);
  
  const { data: reports, isFetching, isError } = useLabRecords(authToken, Patientcode);
  
  const [patientInfo, setPatientInfo] = useState<any>(null);
  useEffect(() => {
    const stored = sessionStorage.getItem("selectedPatient");
    if (stored) setPatientInfo(JSON.parse(stored));
  }, []);

  const patientId   = patientInfo?.MRNo    || patientInfo?.PatientCode || patientInfo?.Mrno;
  const regCode     = patientInfo?.RegNo   || patientInfo?.RegCode;
  const patientname = patientInfo?.patientname || patientInfo?.PatientName || patientInfo?.PATIENTNAME;

  /* ── print ── */
  const currentDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  }).format(new Date());

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Prescription_${patientId}`,
  });

  if (isFetching) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex items-center justify-center animate-pulse">
        <FlaskConical className="w-5 h-5 text-blue-500 dark:text-blue-400" />
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500">Loading lab records…</p>
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center py-20 gap-2">
      <AlertTriangle className="w-8 h-8 text-red-400" />
      <p className="text-sm text-slate-500 dark:text-slate-400">Failed to load lab records</p>
    </div>
  );

  if (!reports || reports.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 gap-2">
      <FlaskConical className="w-8 h-8 text-slate-300 dark:text-slate-600" />
      <p className="text-sm text-slate-500 dark:text-slate-400">No lab records found</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        
        {/* Left Side: Title + Count */}
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Laboratory Reports
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            ({reports.length} report{reports.length > 1 ? "s" : ""})
          </div>
        </div>

        {/* Right Side: Action Buttons - Responsive */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Print All Reports Button */}
          <button
            onClick={handlePrint}
            className="group relative inline-flex items-center justify-center w-5 h-5 sm:w-auto sm:h-auto sm:px-5 sm:py-2.5 
                      bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium 
                      transition-all duration-200 active:scale-95"
            title="Print All Reports"   // Fallback tooltip
          >
            <Printer className="w-5 h-5 sm:mr-2" />
            <span className="hidden sm:inline text-sm">Print All</span>
            
            {/* Hover Text (Mobile + Small screens) */}
            <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1 rounded-md 
                            opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap
                            sm:hidden">
              Print All Reports
            </span>
          </button>

          {/* Download PDF Button */}
          <button
            className="group relative inline-flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-5 sm:py-2.5 
                      border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 
                      text-slate-700 dark:text-slate-300 rounded-xl font-medium 
                      transition-all duration-200 active:scale-95"
            title="Download PDF"
          >
            <FileText className="w-5 h-5 sm:mr-2" />
            <span className="hidden sm:inline text-sm">Download PDF</span>
            
            {/* Hover Text for small screens */}
            <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1 rounded-md 
                            opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap
                            sm:hidden">
              Download PDF
            </span>
          </button>
        </div>
      </div>
      {reports.map((data, idx) => (
        <div
          key={data.TestTranId ?? idx}
          className="
            rounded-2xl border border-slate-200 dark:border-slate-700/60
            bg-white dark:bg-slate-900
            shadow-sm dark:shadow-none
            overflow-hidden
          "
        >
          {/* ── Card header ── */}
          <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-400" />

          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  Laboratory Report
                </h2>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {data.CollectionDate_Eng}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                    <FlaskConical className="w-3 h-3" />
                    {data.TestAlias}
                  </span>
                </div>
              </div>
            </div>

            {/* <button className="
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              border border-blue-200 dark:border-blue-800/40
              text-blue-600 dark:text-blue-400
              bg-blue-50 dark:bg-blue-900/20
              hover:bg-blue-100 dark:hover:bg-blue-900/40
              transition-colors duration-150
            ">
              <FileText className="w-3.5 h-3.5" />
              View Report
            </button> */}
          </div>

          {/* ── Body ── */}
          <div className="p-5 space-y-4">

            {/* Section label */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                {data.Alias}
              </span>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700/60" />
            </div>

            {/* Group + Table */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">

              {/* Group header */}
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {data.GroupName}
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[480px]">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-700/60">
                      {["Test", "Result", "Unit", "Reference", "Flag"].map((h, i) => (
                        <th
                          key={h}
                          className={`
                            px-4 py-2.5
                            text-[10px] font-bold uppercase tracking-widest
                            text-slate-400 dark:text-slate-500
                            ${i === 0 ? "text-left" : "text-center"}
                          `}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                    {data.majorGroups && data.majorGroups.length > 0
                      ? data.majorGroups.map((test: any, tIdx: number) => (
                          <TestRow key={tIdx} test={test} />
                        ))
                      : <TestRow test={data} />
                    }
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer notes */}
            {(data.comment || data.footnote) && (
              <div className="
                rounded-xl border border-amber-100 dark:border-amber-800/30
                bg-amber-50/60 dark:bg-amber-900/10
                px-4 py-3 space-y-1
              ">
                {data.comment && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-amber-700 dark:text-amber-400">Comment: </span>
                    {data.comment}
                  </p>
                )}
                {data.footnote && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-amber-700 dark:text-amber-400">Footnote: </span>
                    {data.footnote}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Print Layout */}
      <div ref={printRef} className="hidden print:block print:bg-white">
        <PrintLayout
          documentType="LABORATORY REPORT"
          hospitalInfo={{
            name: "",
            logo: "/images/logo/inf-nepal-logo-dark.svg",
            address: "",
            phone: "",
            // email: "lab@infnepal.com",   // optional
          }}
          patientInfo={{
            name: patientname || "N/A",
            patientId: patientId || "N/A",
            age: patientInfo?.Age || "—",
            gender: patientInfo?.Gender || "—",
            contact: patientInfo?.Mobile || patientInfo?.Phone || "—",
          }}
          date={currentDate}
          footerNote="This is a computer-generated laboratory report. Results should be interpreted by a qualified physician."
        >
          {/* ====================== LAB REPORT BODY ====================== */}
          <div className="space-y-12">
            {reports.map((data: any, idx: number) => (
              <div key={data.TestTranId ?? idx} className="print:break-inside-avoid">
                
                {/* Test Header */}
                <div className="mb-6 border-b border-gray-300 pb-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {data.TestAlias || data.Alias || "Clinical Laboratory Test"}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">{data.GroupName}</p>
                    </div>
                    <div className="text-right text-sm">
                      {data.CollectionDate_Eng && (
                        <p>
                          <span className="text-gray-500">Collected:</span>{" "}
                          <span className="font-medium">{data.CollectionDate_Eng}</span>
                        </p>
                      )}
                      {data.TestCode && (
                        <p className="font-mono text-xs text-gray-500 mt-1">
                          Test Code: {data.TestCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Results Table */}
                <div className="border border-gray-400 rounded overflow-hidden mb-8">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 border-b-2 border-gray-400">
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 w-5/12">
                          Test Parameter
                        </th>
                        <th className="py-4 px-6 text-center font-semibold text-gray-800">Result</th>
                        <th className="py-4 px-6 text-center font-semibold text-gray-800">Unit</th>
                        <th className="py-4 px-6 text-center font-semibold text-gray-800">Reference Range</th>
                        <th className="py-4 px-6 text-center font-semibold text-gray-800 w-24">Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-900">
                      {data.majorGroups && data.majorGroups.length > 0
                        ? data.majorGroups.map((test: any, tIdx: number) => (
                            <PrintTestRow key={tIdx} test={test} />
                          ))
                        : <PrintTestRow test={data} />
                      }
                    </tbody>
                  </table>
                </div>

                {/* Comments / Footnotes */}
                {(data.comment || data.footnote) && (
                  <div className="bg-amber-50 border border-amber-300 p-5 rounded text-sm">
                    {data.comment && (
                      <p className="mb-3">
                        <span className="font-semibold text-amber-800">Comment: </span>
                        {data.comment}
                      </p>
                    )}
                    {data.footnote && (
                      <p>
                        <span className="font-semibold text-amber-800">Footnote: </span>
                        {data.footnote}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Optional Signature Area */}
          <div className="mt-16 flex justify-end">
            <div className="text-center border-t border-gray-700 w-72 pt-3">
              <p className="font-medium text-gray-800">Pathologist / Lab In-charge</p>
              <p className="text-xs text-gray-500 mt-1">Name • Qualification • Reg. No.</p>
            </div>
          </div>
        </PrintLayout>
      </div>
    </div>
  );
};

/* ── Single test row ── */
function TestRow({ test }: { test: any }) {
  const flag = test.resultflag;

  const flagEl = flag === "H" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30">
      <TrendingUp className="w-3 h-3" /> High
    </span>
  ) : flag === "L" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">
      <TrendingDown className="w-3 h-3" /> Low
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
      <CheckCircle2 className="w-3 h-3" /> Normal
    </span>
  );

  return (
    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors duration-100">
      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium">
        {test.TestAlias}
      </td>
      <td className="px-4 py-2.5 text-center">
        <span className={`font-bold ${
          flag === "H" ? "text-red-600 dark:text-red-400"
          : flag === "L" ? "text-amber-600 dark:text-amber-400"
          : "text-slate-800 dark:text-slate-100"
        }`}>
          {test.Findingvalue}
        </span>
      </td>
      <td className="px-4 py-2.5 text-center text-slate-500 dark:text-slate-400">
        {test.Unit || "—"}
      </td>
      <td className="px-4 py-2.5 text-center text-slate-400 dark:text-slate-500">
        {test.Referencerange || "—"}
      </td>
      <td className="px-4 py-2.5 text-center">
        {flagEl}
      </td>
    </tr>
  );
}


/* ── Print Test Row ── */
function PrintTestRow({ test }: { test: any }) {
  const flag = test.resultflag || test.Flag;

  const getFlagElement = () => {
    if (flag === "H") {
      return (
        <span className="inline-block px-5 py-1 text-xs font-bold bg-red-100 text-red-700 rounded">
          HIGH
        </span>
      );
    }
    if (flag === "L") {
      return (
        <span className="inline-block px-5 py-1 text-xs font-bold bg-amber-100 text-amber-700 rounded">
          LOW
        </span>
      );
    }
    return (
      <span className="inline-block px-5 py-1 text-xs font-bold bg-emerald-100 text-emerald-700 rounded">
        NORMAL
      </span>
    );
  };

  return (
    <tr>
      <td className="py-4 px-6 font-medium border-r border-gray-200">
        {test.TestAlias || test.TestName || "—"}
      </td>
      <td className="py-4 px-6 text-center font-semibold border-r border-gray-200">
        <span className={flag === "H" ? "text-red-700" : flag === "L" ? "text-amber-700" : ""}>
          {test.Findingvalue || test.Result || "—"}
        </span>
      </td>
      <td className="py-4 px-6 text-center border-r border-gray-200 text-gray-600">
        {test.Unit || "—"}
      </td>
      <td className="py-4 px-6 text-center border-r border-gray-200 text-gray-600">
        {test.Referencerange || test.ReferenceRange || "—"}
      </td>
      <td className="py-4 px-6 text-center">
        {getFlagElement()}
      </td>
    </tr>
  );
}


export default LaboratoryRecords;