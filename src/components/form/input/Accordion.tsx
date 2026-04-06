import { ChevronDown, ChevronUp } from "lucide-react";

/* ── Accordion section ── */
const accordionColorMap: Record<string, { label: string; icon: string; border: string; header: string }> = {
  blue:    { label: "text-blue-600 dark:text-blue-400",     icon: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30",       border: "border-blue-100 dark:border-blue-800/30",    header: "bg-blue-50/60 dark:bg-blue-900/10"    },
  violet:  { label: "text-violet-600 dark:text-violet-400", icon: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800/30", border: "border-violet-100 dark:border-violet-800/30", header: "bg-violet-50/60 dark:bg-violet-900/10" },
  emerald: { label: "text-emerald-600 dark:text-emerald-400", icon: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30", border: "border-emerald-100 dark:border-emerald-800/30", header: "bg-emerald-50/60 dark:bg-emerald-900/10" },
  amber:   { label: "text-amber-600 dark:text-amber-400",   icon: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30",     border: "border-amber-100 dark:border-amber-800/30",  header: "bg-amber-50/60 dark:bg-amber-900/10"  },
  rose:    { label: "text-rose-600 dark:text-rose-400",     icon: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/30",         border: "border-rose-100 dark:border-rose-800/30",    header: "bg-rose-50/60 dark:bg-rose-900/10"    },
  teal:    { label: "text-teal-600 dark:text-teal-400",     icon: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-800/30",         border: "border-teal-100 dark:border-teal-800/30",    header: "bg-teal-50/60 dark:bg-teal-900/10"    },
};

export default function Accordion({ icon, title, color = "blue", open, onToggle, children }: {
  icon: React.ReactNode; title: string; color?: string;
  open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  const c = accordionColorMap[color];
  return (
    <div className={`rounded-xl border ${c.border} bg-white dark:bg-slate-800/40 overflow-hidden`}>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 ${c.header} border-b ${open ? c.border : "border-transparent"} transition-colors`}
      >
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg border ${c.icon}`}>{icon}</span>
          <span className={`text-xs font-bold uppercase tracking-widest ${c.label}`}>{title}</span>
        </div>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          : <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
        }
      </button>
      {open && (
        <div className="px-4 py-3 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}
