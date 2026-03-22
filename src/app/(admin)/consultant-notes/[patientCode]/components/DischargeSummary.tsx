"use client";

import { useAuthToken } from "@/context/AuthContext";
import { useDischargeSummary } from "../queries/dischargeSummary.queries";
import {
  CircleOff, Calendar, Stethoscope, Pill,
  ClipboardList, FileText, LogOut, Hash, BadgeCheck,
} from "lucide-react";

interface Props {
  MrNO: string;
}

const IPDDischargeSummary: React.FC<Props> = ({ MrNO }) => {
  const { authToken } = useAuthToken();
  const { data: dischargeSummary, isLoading } = useDischargeSummary(authToken, MrNO);

  const formatList = (text: string) => {
    if (!text) return [];
    return text.split("\n").map((i) => i.trim()).filter(Boolean);
  };

  /* ── States ── */
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 flex items-center justify-center animate-pulse">
        <LogOut className="w-5 h-5 text-violet-500 dark:text-violet-400" />
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500">Loading discharge summary…</p>
    </div>
  );

  if (!dischargeSummary || dischargeSummary.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
        <CircleOff className="w-6 h-6 text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No Discharge Summary Available</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">No records found for this patient</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {dischargeSummary.map((summary: any, index: number) => (
        <div
          key={index}
          className="
            rounded-2xl border border-slate-200 dark:border-slate-700/60
            bg-white dark:bg-slate-900
            shadow-sm dark:shadow-none
            overflow-hidden
          "
        >
          {/* Top accent */}
          <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-purple-400 to-violet-400" />

          {/* ── Card header ── */}
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30">
                <LogOut className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  Discharge Summary
                </h2>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Full patient discharge record
                </p>
              </div>
            </div>

            {/* Meta chips */}
            <div className="flex flex-wrap items-center gap-2">
              <Chip icon={<Calendar className="w-3 h-3" />} label={summary.Date} />
              <Chip icon={<Hash className="w-3 h-3" />} label={`IPD: ${summary.IPDCode}`} />
              {summary.DischargeType && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                  <BadgeCheck className="w-3 h-3" />
                  {summary.DischargeType}
                </span>
              )}
            </div>
          </div>

          {/* ── Body ── */}
          <div className="p-5 space-y-4">

            {/* Diagnosis */}
            <Section icon={<Stethoscope className="w-4 h-4" />} title="Diagnosis" color="blue">
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {summary.Diagnosis || "—"}
              </p>
              {summary.PreOPDiagnosis && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                  <span className="font-semibold">Pre-Op:</span> {summary.PreOPDiagnosis}
                </p>
              )}
            </Section>

            {/* Medications */}
            {formatList(summary.RX).length > 0 && (
              <Section icon={<Pill className="w-4 h-4" />} title="Medications (Rx)" color="violet">
                <ul className="space-y-1.5">
                  {formatList(summary.RX).map((rx: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 dark:bg-violet-500 flex-shrink-0" />
                      {rx}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Advice */}
            {formatList(summary.ADVICE).length > 0 && (
              <Section icon={<ClipboardList className="w-4 h-4" />} title="Advice" color="emerald">
                <ul className="space-y-1.5">
                  {formatList(summary.ADVICE).map((adv: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 flex-shrink-0" />
                      {adv}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

          </div>
        </div>
      ))}
    </div>
  );
};

/* ── Section block ── */
const colorMap: Record<string, { label: string; icon: string; dot: string; border: string }> = {
  blue:    { label: "text-blue-600 dark:text-blue-400",    icon: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30",    dot: "bg-blue-400 dark:bg-blue-500",    border: "border-blue-100 dark:border-blue-800/30"    },
  violet:  { label: "text-violet-600 dark:text-violet-400", icon: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800/30", dot: "bg-violet-400 dark:bg-violet-500", border: "border-violet-100 dark:border-violet-800/30" },
  emerald: { label: "text-emerald-600 dark:text-emerald-400", icon: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30", dot: "bg-emerald-400 dark:bg-emerald-500", border: "border-emerald-100 dark:border-emerald-800/30" },
};

function Section({
  icon, title, color = "blue", children,
}: {
  icon: React.ReactNode;
  title: string;
  color?: string;
  children: React.ReactNode;
}) {
  const c = colorMap[color];
  return (
    <div className={`rounded-xl border ${c.border} bg-white dark:bg-slate-800/40 overflow-hidden`}>
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-800/60">
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg border ${c.icon}`}>
          {icon}
        </span>
        <span className={`text-xs font-bold uppercase tracking-widest ${c.label}`}>
          {title}
        </span>
      </div>
      <div className="px-4 py-3">
        {children}
      </div>
    </div>
  );
}

/* ── Info chip ── */
function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-[10px] text-slate-500 dark:text-slate-400">
      <span className="text-slate-400 dark:text-slate-500">{icon}</span>
      <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
    </div>
  );
}

export default IPDDischargeSummary;