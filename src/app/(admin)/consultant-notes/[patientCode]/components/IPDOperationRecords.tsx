"use client";

import { useAuthToken } from "@/context/AuthContext";
import { useOperationRecord } from "../queries/operaationrecord.queries";
import {
  CircleOff, CalendarDays, User, Stethoscope,
  Scissors, ClipboardList, Users, BadgeInfo, ShieldPlus,
} from "lucide-react";

interface props {
  PatientCode: string;
}

const IPDOperationRecords: React.FC<props> = ({ PatientCode }) => {
  const { authToken } = useAuthToken();
  const { data: operationRecords, isLoading } = useOperationRecord(authToken, PatientCode ?? null);

  /* ── States ── */
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 flex items-center justify-center animate-pulse">
        <Scissors className="w-5 h-5 text-rose-500 dark:text-rose-400" />
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500">Loading operation records…</p>
    </div>
  );

  if (!operationRecords || operationRecords.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
        <CircleOff className="w-6 h-6 text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No Operation Records</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">No records found for this patient</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {operationRecords.map((op) => (
        <div
          key={op.OperationId}
          className="
            rounded-2xl border border-slate-200 dark:border-slate-700/60
            bg-white dark:bg-slate-900
            shadow-sm dark:shadow-none
            overflow-hidden
          "
        >
          {/* Top accent */}
          <div className="h-0.5 w-full bg-gradient-to-r from-rose-500 via-pink-400 to-rose-400" />

          {/* ── Card header ── */}
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30">
                <Scissors className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {op.Op_Executed || "Operation"}
                </h2>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Operation Record
                </p>
              </div>
            </div>

            {/* Meta chips */}
            <div className="flex flex-wrap items-center gap-2">
              <Chip icon={<CalendarDays className="w-3 h-3" />} label={op.Date} />
              <Chip icon={<User className="w-3 h-3" />} label={op.TeamMember} />
            </div>
          </div>

          {/* ── Body ── */}
          <div className="p-5 space-y-4">

            {/* Pre / Post Diagnosis */}
            <div className="grid md:grid-cols-2 gap-4">
              <Section icon={<Stethoscope className="w-4 h-4" />} title="Pre-Op Diagnosis" color="blue">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {op.PreOPDiagnosis || "—"}
                </p>
              </Section>

              <Section icon={<ShieldPlus className="w-4 h-4" />} title="Post-Op Diagnosis" color="emerald">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {op.PostOpDiagnosis || "—"}
                </p>
              </Section>
            </div>

            {/* Operation Notes */}
            {op.Diagnosis && (
              <Section icon={<ClipboardList className="w-4 h-4" />} title="Operation Notes" color="rose">
                <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                  {op.Diagnosis}
                </pre>
              </Section>
            )}

            {/* Footer meta */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { icon: <Users className="w-3 h-3" />,    label: "Group", value: op.Group },
                { icon: <BadgeInfo className="w-3 h-3" />, label: "Role",  value: op.MemberRole },
                { icon: <User className="w-3 h-3" />,      label: "User",  value: op.user },
              ].map(({ icon, label, value }) => value && (
                <div
                  key={label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-[10px]"
                >
                  <span className="text-slate-400 dark:text-slate-500">{icon}</span>
                  <span className="text-slate-400 dark:text-slate-500">{label}:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{value}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      ))}
    </div>
  );
};

/* ── Section block ── */
const colorMap: Record<string, { label: string; icon: string; border: string }> = {
  blue:    { label: "text-blue-600 dark:text-blue-400",     icon: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30",      border: "border-blue-100 dark:border-blue-800/30"    },
  emerald: { label: "text-emerald-600 dark:text-emerald-400", icon: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30", border: "border-emerald-100 dark:border-emerald-800/30" },
  rose:    { label: "text-rose-600 dark:text-rose-400",     icon: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/30",      border: "border-rose-100 dark:border-rose-800/30"    },
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
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-800/60">
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg border ${c.icon}`}>
          {icon}
        </span>
        <span className={`text-xs font-bold uppercase tracking-widest ${c.label}`}>
          {title}
        </span>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

/* ── Info chip ── */
function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-[10px]">
      <span className="text-slate-400 dark:text-slate-500">{icon}</span>
      <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
    </div>
  );
}

export default IPDOperationRecords;