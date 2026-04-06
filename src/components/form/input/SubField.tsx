export default function SubField({ label, value }: { label: string; value: any }) {
  if (!value || String(value).trim() === "") return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{value}</p>
    </div>
  );
}