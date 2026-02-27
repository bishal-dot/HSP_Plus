"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Plus,
  Clock,
  User,
  Tag,
  StickyNote,
  MoreHorizontal,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuthToken } from "@/context/AuthContext";
import { useProgressNote } from "../queries/progress-note.queries";
import { ProgressNote } from "@/services/progress-note.service";


function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDisciplineColor(discipline: string) {
  const map: Record<string, string> = {
    "Physical Therapy": "bg-sky-100 text-sky-700 border-sky-200",
    "Occupational Therapy": "bg-violet-100 text-violet-700 border-violet-200",
    "Speech Therapy": "bg-emerald-100 text-emerald-700 border-emerald-200",
    Nursing: "bg-rose-100 text-rose-700 border-rose-200",
    "Social Work": "bg-amber-100 text-amber-700 border-amber-200",
    "Respiratory Therapy": "bg-teal-100 text-teal-700 border-teal-200",
  };
  return map[discipline] ?? "bg-slate-100 text-slate-700 border-slate-200";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: "completed" | "pending" }) {
  if (status === "completed")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
        <CheckCircle2 size={12} /> Completed
      </span>
    );
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500">
        <AlertCircle size={12} /> Pending
      </span>
    );
  return null;
}

function NoteCard({
  note,
  onDelete,
}: {
  note: ProgressNote;
  onDelete: (id: number) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 p-5">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getDisciplineColor(
              note.DISCIPLINE ?? ""
            )}`}
          >
            <Tag size={11} />
            {note.DISCIPLINE}
          </span>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[130px]">
              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <Edit3 size={14} /> Edit
              </button>
              <button
                onClick={() => {
                  onDelete(note.UNKID);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-500 hover:bg-rose-50"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Note body */}
      <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">
        {note.PATIENTPROGRESSNOTE}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <User size={12} />
          {note.C_USER}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={12} />
          {formatDate(note.C_DATE ?? "")}
        </span>
      </div>
    </div>
  );
}

interface props {
  PatientCode: string;
}

const ProgressNotePage: React.FC<props> = ({ PatientCode }) => {
  const { authToken } = useAuthToken();

  const { data: ProgressNoteData } = useProgressNote(authToken, PatientCode);

  console.log("ProgressNoteData", ProgressNoteData);

  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [discipline, setDiscipline] = useState("");
  const [noteText, setNoteText] = useState("");
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState<ProgressNote[]>([]); // start empty
  const [view, setView] = useState<"cards" | "table">("cards");
  const [successMsg, setSuccessMsg] = useState(false);

  // const filtered = notes.filter(
  //   (n) =>
  //     n.DISCIPLINE.toLowerCase().includes(search.toLowerCase()) ||
  //     n.PATIENTPROGRESSNOTE.toLowerCase().includes(search.toLowerCase())
  // );

  useEffect(() => {
    if (ProgressNoteData) {
      setNotes(ProgressNoteData);
    }
  }, [ProgressNoteData]);

 async function handleSave() {
    if (!discipline || !noteText.trim()) return;

    const newNote: ProgressNote = {
      UNKID: Date.now(),
      DATE: date,
      DISCIPLINE: discipline,
      PATIENTPROGRESSNOTE: noteText,
      C_USER: 1,
      C_DATE: null,
      MRNO: PatientCode,
      WARDCODE: "",
      BEDCODE: "",
      COMMENTS: "",
      CENTERCODE: 1,
      DEPTCODE: 1,
      IPDCODE: "",
      TIME: "",
    };

    try{
      const response = await fetch(`/api/inpatients/progress-note/${PatientCode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          MRNO: PatientCode,
          WARDCODE: "",
          BEDCODE: "",
          DATE: newNote.DATE,
          TIME: "",
          DISCIPLINE: newNote.DISCIPLINE,
          PATIENTPROGRESSNOTE: newNote.PATIENTPROGRESSNOTE,
          COMMENTS: "",
          C_USER: newNote.C_USER,
          C_DATE: newNote.C_DATE,
          CENTERCODE: "",
          DEPTCODE: "",
          IPDCODE: ""
        }),
        cache: "no-cache",
      });

      if(!response.ok) throw new Error("Failed to save Progress Note");

      setNotes((prev) => [newNote, ...prev]);
      setDiscipline("");
      setNoteText("");
      setDate(today);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (error: any) {
      console.error(error);
    } 
  }

  function handleDelete(id: number) {
    setNotes((prev) => prev.filter((n) => n.UNKID !== id));
  }

  return (
    <div className="min-h-screen font-[system-ui]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        {/* … same header as before … */}
      </header>

      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* ── Left Panel: Form ── */}
          <aside className="xl:w-100 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-4">
                <h2 className="text-white font-semibold text-sm flex items-center gap-2">
                  <Plus size={16} /> New Observation
                </h2>
              </div>

              <div className="p-5 space-y-5">
                {/* Success */}
                {successMsg && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 text-sm text-emerald-700">
                    <CheckCircle2 size={15} /> Note saved successfully!
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent bg-slate-50 text-slate-700"
                    />
                  </div>
                </div>

                {/* Discipline as input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Discipline
                  </label>
                  <div className="relative">
                    <Tag
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={discipline}
                      onChange={(e) => setDiscipline(e.target.value)}
                      placeholder="Enter discipline..."
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent bg-slate-50 text-slate-700"
                    />
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Note
                  </label>
                  <div className="relative">
                    <StickyNote
                      size={15}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Enter your observation here…"
                      rows={5}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent bg-slate-50 text-slate-700 resize-none placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Save button */}
                <button
                  onClick={handleSave}
                  disabled={!discipline || !noteText.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-md shadow-sky-200 hover:shadow-sky-300 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Save Note
                </button>
              </div>
            </div>

            {/* Stats card */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => null)}
            </div>
          </aside>

          {/* ── Right Panel: List ── */}
          <section className="flex-1 min-w-0">
            {/* … same search, filter, cards & table view as before … */}
          </section>
        </div>
      </main>
    </div>
  );
};

export default ProgressNotePage;