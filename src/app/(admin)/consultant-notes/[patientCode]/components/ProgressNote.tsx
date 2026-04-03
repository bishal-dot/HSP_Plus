"use client";

import { useState } from "react";
import {
  Calendar, Plus, Clock, User, Tag, StickyNote,
  MoreHorizontal, Trash2, Edit3, CheckCircle2, AlertCircle,
  NotebookPen,
} from "lucide-react";
import { useAuthToken } from "@/context/AuthContext";
import { useProgressNote } from "../queries/progress-note.queries";
import { ProgressNote } from "@/services/progress-note.service";
import { ProgressNoteResponse } from "@/types/progress-note.types";

import { useMutation } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function getDisciplineColor(discipline: string) {
  const map: Record<string, string> = {
    "Physical Therapy":    "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800/30",
    "Occupational Therapy":"bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800/30",
    "Speech Therapy":      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30",
    "Nursing":             "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30",
    "Social Work":         "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30",
    "Respiratory Therapy": "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800/30",
  };
  return map[discipline] ?? "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/60 dark:text-slate-400 dark:border-slate-600/40";
}

/* ── Note card ── */
function NoteCard({ note, onDelete }: { note: ProgressNoteResponse; onDelete?: (id: number) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="
      group relative rounded-2xl border border-slate-200 dark:border-slate-700/60
      bg-white dark:bg-slate-800/60
      hover:border-sky-200 dark:hover:border-sky-700/40
      hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none
      transition-all duration-150 overflow-hidden
    ">
      {/* Left discipline accent */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-sky-400 to-cyan-400" />

      <div className="pl-4 pr-4 pt-3.5 pb-3.5 space-y-2.5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${getDisciplineColor(note.DISCIPLINE ?? "")}`}>
            <Tag className="w-2.5 h-2.5" />
            {note.DISCIPLINE || "General"}
          </span>

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 min-w-[120px]">
                <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  // onClick={() => { onDelete?.(note.unkid); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Note body */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
          {note.PATIENTPROGRESSNOTE}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700/60">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {note.USER}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {note.date ? formatDate(note.date) : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Page ── */
interface props { PatientCode: string }

const ProgressNotePage: React.FC<props> = ({ PatientCode }) => {
  const { authToken } = useAuthToken();

  const [patientInfo, setPatientInfo] = useState(() => {
    const stored = sessionStorage.getItem('selectedPatient');
    return stored ? JSON.parse(stored) : null;
  });

  const patientId = patientInfo?.MRNO || patientInfo?.PatientCode || patientInfo?.Mrno;

  const mrno = '01204502';
  const { data: ProgressNoteData } = useProgressNote(authToken, PatientCode) as {
    data: ProgressNoteResponse[] | undefined;
  };

  const today = new Date().toISOString().split("T")[0];
  const [date,        setDate]        = useState(today);
  const [discipline,  setDiscipline]  = useState("");
  const [noteText,    setNoteText]    = useState("");
  const [successMsg,  setSuccessMsg]  = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  const saveNotes = async () => {
    const response = await fetch(`/api/inpatients/progress-note/${PatientCode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        MRNO: patientId,
        WARDCODE: "", BEDCODE: "",
        DATE: date, TIME: "",
        DISCIPLINE: discipline,
        PATIENTPROGRESSNOTE: noteText,
        COMMENTS: "",
        C_USER: 1,
        CENTERCODE: 1,
        DEPTCODE: patientInfo?.DEPTCODE ?? null,  
        IPDCODE: patientInfo?.IPDCODE?.toString() ?? "",
      }),
      cache: "no-cache",
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to save");
    setDiscipline(""); setNoteText(""); setDate(today);
    return result;
  }  

  const { mutate, isPending } = useMutation({
    mutationFn: saveNotes,
    onSuccess: () => {
      toast.success("Notes saved successfully.");
    },
    onError: (err: any) => {
      toast.error("Failed to save notes. Please try again.");
    }
  })

  const handleSave = () => { 
    if (!discipline || !noteText.trim()) {
      toast.error("Please fill in discipline and note.");
      return;
    }
    mutate(); 
  }

  const labelClass = "block text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5";
  const inputClass = `
    w-full px-3 py-2 rounded-lg text-xs
    border border-slate-200 dark:border-slate-700
    bg-slate-50 dark:bg-slate-800/60
    text-slate-800 dark:text-slate-200
    placeholder:text-slate-300 dark:placeholder:text-slate-600
    focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 dark:focus:border-sky-500
    transition-all duration-150
  `;

  return (
    <>
      <ToastContainer autoClose={3000} />
      <div className="flex flex-col xl:flex-row gap-5">

      {/* ══════════════════════════════
          LEFT — Form panel
      ══════════════════════════════ */}
      <aside className="xl:w-80 shrink-0">
        <div className="
          rounded-2xl border border-slate-200 dark:border-slate-700/60
          bg-white dark:bg-slate-900
          shadow-sm dark:shadow-none overflow-hidden
        ">
          {/* Panel header */}
          <div className="h-0.5 w-full bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-400" />
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/30">
              <NotebookPen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
              New Observation
            </h2>
          </div>

          <div className="p-5 space-y-4">
            {/* Success banner */}
            {successMsg && (
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> Note saved successfully!
              </div>
            )}

            {/* Date */}
            <div>
              <label className={labelClass}>Date</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className={`${inputClass} pl-8`} />
              </div>
            </div>

            {/* Discipline */}
            <div>
              <label className={labelClass}>Discipline</label>
              <div className="relative">
                <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input type="text" value={discipline} onChange={(e) => setDiscipline(e.target.value)}
                  placeholder="e.g. Nursing, Physical Therapy…"
                  className={`${inputClass} pl-8`} />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className={labelClass}>Note</label>
              <div className="relative">
                <StickyNote className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <textarea rows={5} value={noteText} onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter your observation here…"
                  className={`${inputClass} pl-8 resize-none leading-relaxed`} />
              </div>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={isPending}
              className="
                w-full py-2.5 rounded-xl text-xs font-semibold
                inline-flex items-center justify-center gap-1.5
                bg-sky-600 hover:bg-sky-700
                dark:bg-sky-600 dark:hover:bg-sky-700
                text-white shadow-sm shadow-sky-200 dark:shadow-sky-900/40
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-150 active:scale-[0.98]
              "
            >
              <Plus className="w-3.5 h-3.5" />
              { isPending ? "Saving..." : "Save note" }
            </button>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════
          RIGHT — Notes list
      ══════════════════════════════ */}
      <section className="flex-1 min-w-0">
        <div className="
          rounded-2xl border border-slate-200 dark:border-slate-700/60
          bg-white dark:bg-slate-900
          shadow-sm dark:shadow-none overflow-hidden
        ">
          {/* Section header */}
          <div className="h-0.5 w-full bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-400" />
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/30">
                <StickyNote className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
                Progress Notes
              </h2>
            </div>
            {ProgressNoteData && ProgressNoteData.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-[11px] font-bold">
                {ProgressNoteData.length}
              </span>
            )}
          </div>

          <div className="p-5">
            {!ProgressNoteData || ProgressNoteData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <StickyNote className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No progress notes yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Add a note using the form on the left</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {ProgressNoteData.map((nt: ProgressNoteResponse) => (
                  <NoteCard key={`${nt.unkid}-${nt.date}-${nt.DISCIPLINE}`} note={nt} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  </>
  );
};

export default ProgressNotePage;