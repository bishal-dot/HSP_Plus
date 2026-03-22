"use client";

import { useAuthToken } from "@/context/AuthContext";
import { Image, FileText, Calendar, Search, ScanLine, AlertTriangle } from "lucide-react";
import React, { useState } from "react";
import { useImagingRecords } from "../queries/imaging-records.queries";

interface props {
  Patientcode: string;
}

const ImagingRecords: React.FC<props> = ({ Patientcode }) => {
  const { authToken } = useAuthToken();
  const { data: imagingRecords, isFetching, isError } = useImagingRecords(authToken, Patientcode);
  const [search, setSearch] = useState("");

  const filtered = imagingRecords?.filter((r) =>
    [r.DocumentTitle, r.DocumentTag, r.TranDate]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* ── States ── */
  if (isFetching) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800/30 flex items-center justify-center animate-pulse">
        <ScanLine className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500">Loading imaging records…</p>
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center py-20 gap-2">
      <AlertTriangle className="w-8 h-8 text-red-400" />
      <p className="text-sm text-slate-500 dark:text-slate-400">Failed to load imaging records</p>
    </div>
  );

  if (!imagingRecords || imagingRecords.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 gap-2">
      <ScanLine className="w-8 h-8 text-slate-300 dark:text-slate-600" />
      <p className="text-sm text-slate-500 dark:text-slate-400">No imaging records found</p>
    </div>
  );

  return (
    <div className="
      rounded-2xl border border-slate-200 dark:border-slate-700/60
      bg-white dark:bg-slate-900
      shadow-sm dark:shadow-none
      overflow-hidden
    ">
      {/* Top accent */}
      <div className="h-0.5 w-full bg-gradient-to-r from-cyan-500 via-blue-400 to-cyan-400" />

      {/* ── Header ── */}
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800/30">
            <ScanLine className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
              Imaging Records
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              {imagingRecords.length} record{imagingRecords.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by type, tag or date…"
            className="
              w-full pl-8 pr-3 py-2 rounded-lg text-xs
              border border-slate-200 dark:border-slate-700
              bg-slate-50 dark:bg-slate-800/60
              text-slate-800 dark:text-slate-200
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 dark:focus:border-cyan-500
              transition-all duration-150
            "
          />
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="p-5">
        {filtered && filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Search className="w-6 h-6 text-slate-300 dark:text-slate-600" />
            <p className="text-xs text-slate-400 dark:text-slate-500">No records match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered?.map((record) => (
              <div
                key={record.UnkId}
                className="
                  group rounded-xl border border-slate-200 dark:border-slate-700/60
                  bg-white dark:bg-slate-800/60
                  hover:border-cyan-300 dark:hover:border-cyan-700/50
                  hover:shadow-md dark:hover:shadow-none
                  hover:-translate-y-0.5
                  transition-all duration-150 overflow-hidden
                "
              >
                {/* Image area */}
                <div className="
                  h-36 flex items-center justify-center overflow-hidden
                  bg-slate-50 dark:bg-slate-800
                  border-b border-slate-100 dark:border-slate-700/60
                ">
                  {record.URL ? (
                    <img
                      src={record.URL}
                      alt={record.DocumentTitle}
                      className="object-contain h-full w-full"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600/40 flex items-center justify-center">
                        <Image className="w-5 h-5 text-slate-300 dark:text-slate-500" />
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">No image available</span>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-3.5 space-y-2.5">
                  {/* Title + date */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
                      {record.DocumentTitle}
                    </h3>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">
                      <Calendar className="w-3 h-3" />
                      {record.TranDate}
                    </span>
                  </div>

                  {/* Tag */}
                  {record.DocumentTag && (
                    <span className="
                      inline-flex items-center px-2 py-0.5 rounded-md
                      text-[10px] font-semibold
                      bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400
                      border border-cyan-200 dark:border-cyan-800/30
                    ">
                      {record.DocumentTag}
                    </span>
                  )}

                  {/* Description */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {record.ImgDescription || "No description available."}
                  </p>

                  {/* View button */}
                  <button className="
                    w-full inline-flex items-center justify-center gap-1.5
                    px-3 py-1.5 rounded-lg text-[11px] font-medium
                    border border-slate-200 dark:border-slate-700
                    text-slate-600 dark:text-slate-400
                    bg-white dark:bg-slate-800/50
                    hover:bg-cyan-50 dark:hover:bg-cyan-900/20
                    hover:border-cyan-300 dark:hover:border-cyan-700/50
                    hover:text-cyan-700 dark:hover:text-cyan-400
                    transition-all duration-150
                  ">
                    <FileText className="w-3 h-3" />
                    View Full Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagingRecords;