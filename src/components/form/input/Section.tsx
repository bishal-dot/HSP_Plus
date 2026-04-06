/* ── Section block (for summary viewer) ── */
const colorMap: Record<string, { label: string; icon: string; border: string }> = {
  blue:    { label: "text-blue-600 dark:text-blue-400",     icon: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30",       border: "border-blue-100 dark:border-blue-800/30"    },
  violet:  { label: "text-violet-600 dark:text-violet-400", icon: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800/30", border: "border-violet-100 dark:border-violet-800/30" },
  emerald: { label: "text-emerald-600 dark:text-emerald-400", icon: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30", border: "border-emerald-100 dark:border-emerald-800/30" },
  amber:   { label: "text-amber-600 dark:text-amber-400",   icon: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30",     border: "border-amber-100 dark:border-amber-800/30"  },
  rose:    { label: "text-rose-600 dark:text-rose-400",     icon: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/30",         border: "border-rose-100 dark:border-rose-800/30"    },
  teal:    { label: "text-teal-600 dark:text-teal-400",     icon: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-800/30",         border: "border-teal-100 dark:border-teal-800/30"    },
  slate: {
  label: "text-slate-600 dark:text-slate-400",
  icon: "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800/30",
  border: "border-slate-200 dark:border-slate-700/60"
}
};

type ColorKey = keyof typeof colorMap;

export default function Section({ icon, title, color = "blue", children }: {
  icon: React.ReactNode; title: string; color?: ColorKey; children: React.ReactNode;
}) {
  const c = colorMap[color];
  return (
    <div className={`rounded-xl border ${c.border} bg-white dark:bg-slate-800/40 overflow-hidden`}>
      <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${c.border} bg-slate-50/80 dark:bg-slate-800/60`}>
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg border ${c.icon}`}>{icon}</span>
        <span className={`text-xs font-bold uppercase tracking-widest ${c.label}`}>{title}</span>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}