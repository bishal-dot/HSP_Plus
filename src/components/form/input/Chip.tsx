export default function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-[10px]">
      <span className="text-slate-400 dark:text-slate-500">{icon}</span>
      <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
    </div>
  );
}