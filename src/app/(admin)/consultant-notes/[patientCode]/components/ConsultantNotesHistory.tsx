"use client";

import { useAuthToken } from "@/context/AuthContext";
import { useConsultantNotes } from "@/app/(admin)/consultant-notes/[patientCode]/queries/consultant-notes.queries";
import { consultantNotesResponse } from "@/types/consultant-notes.type";
import {
  FileText, Stethoscope, Activity, ChevronDown, ChevronUp,
  Building2, AlertCircle, Edit, Plus,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  patientCode: string;
  onCreateNew?: () => void;
}

const PreviousConsultantNotes: React.FC<Props> = ({ patientCode, onCreateNew }) => {
  const { authToken } = useAuthToken();
  const { data, isFetching, isError } = useConsultantNotes(authToken, patientCode);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const notes: consultantNotesResponse[] = Array.isArray(data) ? data : [];

  if (!patientCode) return (
    <p className="text-xs text-slate-400 dark:text-slate-500 p-4">Loading patient info…</p>
  );

  return (
    <div className="space-y-4">

      {/* ── Header bar ── */}
      <div className="
        relative overflow-hidden rounded-2xl
        border border-slate-200 dark:border-slate-700/60
        bg-white dark:bg-slate-900
        shadow-sm dark:shadow-none px-5 py-4
      ">
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-blue-500 to-cyan-500" />
        <div className="pl-3 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
              Previous Consultation Notes
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              {isFetching ? "Loading…" : `${notes.length} consultation${notes.length !== 1 ? "s" : ""} on record`}
            </p>
          </div>

          <button
            onClick={() => onCreateNew?.()}
            className="
              inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold
              bg-blue-600 hover:bg-blue-700
              dark:bg-blue-600 dark:hover:bg-blue-700
              text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/40
              transition-all duration-150 active:scale-[0.98]
            "
          >
            <Plus className="w-3.5 h-3.5" />
            Create New Note
          </button>
        </div>
      </div>

      {/* ── Loading ── */}
      {isFetching && (
        <div className="
          rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700/40
          bg-white dark:bg-slate-900 p-12 flex flex-col items-center gap-3
        ">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex items-center justify-center animate-pulse">
            <Activity className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Fetching consultation notes…</p>
        </div>
      )}

      {/* ── Empty ── */}
      {!isFetching && notes.length === 0 && (
        <div className="
          rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700/40
          bg-white dark:bg-slate-900 p-12 flex flex-col items-center gap-3
        ">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            <FileText className="w-6 h-6 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No Previous Notes</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">No consultation notes found for this patient</p>
          <button
            onClick={() => onCreateNew?.()}
            className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Create First Note
          </button>
        </div>
      )}

      {/* ── Notes list ── */}
      {!isFetching && notes.length > 0 && (
        <div className="space-y-3">
          {notes.map((note) => {
            const isExpanded = expandedId === note.UnkID;
            const isOPD      = note.visittype === "OPD";

            return (
              <div
                key={note.UnkID}
                className="
                  rounded-2xl border border-slate-200 dark:border-slate-700/60
                  bg-white dark:bg-slate-900
                  shadow-sm dark:shadow-none
                  overflow-hidden
                  transition-all duration-150
                "
              >
                {/* Top accent */}
                <div className={`h-0.5 w-full bg-gradient-to-r ${isOPD ? "from-blue-500 to-cyan-400" : "from-violet-500 to-purple-400"}`} />

                {/* Collapsed header */}
                <button
                  onClick={() => setExpandedId(prev => prev === note.UnkID ? null : note.UnkID)}
                  className="w-full px-5 py-3.5 flex items-start justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    {/* Badges row */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`
                        inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border
                        ${isOPD
                          ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/30"
                          : "bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800/30"}
                      `}>
                        {note.visittype}
                      </span>
                      {note.RegCode && (
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                          #{note.RegCode}
                        </span>
                      )}
                    </div>

                    {/* Diagnosis title */}
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug truncate">
                      {note.Diagnosis?.split("\n")[0] || "General Consultation"}
                    </p>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-400 dark:text-slate-500">
                      {note.BlockedBy && (
                        <span className="flex items-center gap-1">
                          <Stethoscope className="w-3 h-3" />
                          {note.BlockedBy}
                        </span>
                      )}
                      {note.FacultyName && (
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {note.FacultyName}
                        </span>
                      )}
                      {note.CENTERNAME && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {note.CENTERNAME}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 pt-1">
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                  </div>
                </button>

                {/* Expanded body */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 space-y-3 border-t border-slate-100 dark:border-slate-700/60">
                    <NoteField label="Diagnosis"          value={note.Diagnosis}         color="blue"   />
                    <NoteField label="Present Complaints" value={note.PresentComplaints}               />
                    <NoteField label="Previous History"   value={note.PreviousHistory}                 />
                    <NoteField label="Allergies"          value={note.Allergies}         color="amber"  alert />
                    <NoteField label="Treatment Plan"     value={note.TreatmentPlan}                   />
                    <NoteField label="Recommendation"     value={note.Recommendation}                  />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ── Note field ── */
const fieldColorMap: Record<string, { label: string; bg: string; border: string; text: string }> = {
  blue:  { label: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-900/10",   border: "border-blue-100 dark:border-blue-800/30",   text: "text-blue-900 dark:text-blue-200"   },
  amber: { label: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/10", border: "border-amber-100 dark:border-amber-800/30", text: "text-amber-900 dark:text-amber-200" },
  slate: { label: "text-slate-500 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-800/40", border: "border-slate-100 dark:border-slate-700/60", text: "text-slate-700 dark:text-slate-300"  },
};

function NoteField({ label, value, color = "slate", alert = false }: {
  label: string; value?: string; color?: string; alert?: boolean;
}) {
  if (!value) return null;
  const c = fieldColorMap[color] ?? fieldColorMap.slate;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {alert && <AlertCircle className="w-3 h-3 text-amber-500" />}
        <span className={`text-[10px] font-bold uppercase tracking-widest ${c.label}`}>{label}</span>
      </div>
      <div className={`px-3 py-2.5 rounded-xl border text-xs leading-relaxed whitespace-pre-wrap ${c.bg} ${c.border} ${c.text}`}>
        {value}
      </div>
    </div>
  );
}

export default PreviousConsultantNotes;