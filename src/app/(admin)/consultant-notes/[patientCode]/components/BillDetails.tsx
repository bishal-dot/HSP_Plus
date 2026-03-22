"use client";

import React from "react";
import { Printer, Download, ReceiptText, Wallet, Scale, ArrowDownCircle } from "lucide-react";
import { useAuthToken } from "@/context/AuthContext";
import { useBillMasters, useBillPaymentReceipt } from "../queries/bill-details.queries";

interface props {
  PatientCode: string;
}

const BillDetailsPage: React.FC<props> = ({ PatientCode }) => {
  const { authToken } = useAuthToken();

  const { data: billMasters }        = useBillMasters(authToken, PatientCode);
  const { data: billPaymentReceipt } = useBillPaymentReceipt(authToken, PatientCode);

  const totalBilled  = billMasters?.reduce((t, b) => t + b.Amount, 0) ?? 0;
  const totalReceipt = billPaymentReceipt?.reduce((t, i) => t + i.Amount, 0) ?? 0;
  const totalBalance = totalBilled - totalReceipt;

  return (
    <div className="space-y-4">

      {/* ── Page header ── */}
      <div className="
        relative overflow-hidden
        rounded-2xl border border-slate-200 dark:border-slate-700/60
        bg-white dark:bg-slate-900
        shadow-sm dark:shadow-none px-5 py-4
      ">
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-indigo-500 to-blue-600" />
        <div className="flex items-center justify-between gap-4 pl-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
              <ReceiptText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">IPD Bill Details</h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Billing and payment summary</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="
              inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
              border border-slate-200 dark:border-slate-700
              text-slate-600 dark:text-slate-300
              bg-white dark:bg-slate-800
              hover:bg-slate-50 dark:hover:bg-slate-700
              transition-all duration-150
            ">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button className="
              inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold
              bg-indigo-600 hover:bg-indigo-700 text-white
              shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40
              transition-all duration-150
            ">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary chips ── */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          label="Total Billed"
          value={`Rs. ${totalBilled.toFixed(2)}`}
          icon={<ReceiptText className="w-4 h-4" />}
          color="indigo"
        />
        <SummaryCard
          label="Total Receipts"
          value={`Rs. ${totalReceipt.toFixed(2)}`}
          icon={<Wallet className="w-4 h-4" />}
          color="emerald"
        />
        <SummaryCard
          label="Balance Due"
          value={`Rs. ${totalBalance.toFixed(2)}`}
          icon={<Scale className="w-4 h-4" />}
          color={totalBalance > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* ── Billed Services ── */}
      <TableCard
        icon={<ReceiptText className="w-4 h-4" />}
        title="Billed Services"
        color="indigo"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[500px]">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-700/60">
                {["Service Type", "Description", "Qty", "Rate", "Amount"].map((h, i) => (
                  <th key={h} className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ${i >= 2 ? "text-right" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
              {billMasters?.map((bill, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors duration-100">
                  <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{bill.ServiceTypename}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">{bill.ServiceName}</td>
                  <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">{bill.Qty}</td>
                  <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">Rs. {bill.Rate.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-slate-800 dark:text-slate-100">Rs. {bill.Amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-indigo-100 dark:border-indigo-800/30 bg-indigo-50/60 dark:bg-indigo-900/10">
                <td colSpan={4} className="px-4 py-2.5 text-right text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Total Billed</td>
                <td className="px-4 py-2.5 text-right text-sm font-extrabold text-indigo-700 dark:text-indigo-300">Rs. {totalBilled.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </TableCard>

      {/* ── Receipt Details ── */}
      <TableCard
        icon={<Wallet className="w-4 h-4" />}
        title="Receipt / Deposit Details"
        color="emerald"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[480px]">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-700/60">
                {["Receipt No.", "Date", "Description", "Amount"].map((h, i) => (
                  <th key={h} className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ${i === 3 ? "text-right" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
              {billPaymentReceipt?.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors duration-100">
                  <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-slate-400">{item.Remarks}</td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {item.Date_E.split("T")[0]}
                    <span className="text-slate-300 dark:text-slate-600 mx-1">/</span>
                    {item.Date_N}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{item.Particular}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-slate-800 dark:text-slate-100">Rs. {item.Amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-emerald-100 dark:border-emerald-800/30 bg-emerald-50/60 dark:bg-emerald-900/10">
                <td colSpan={3} className="px-4 py-2.5 text-right text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Total Receipts</td>
                <td className="px-4 py-2.5 text-right text-sm font-extrabold text-emerald-700 dark:text-emerald-300">Rs. {totalReceipt.toFixed(2)}</td>
              </tr>
              <tr className={`border-t-2 ${totalBalance > 0 ? "border-rose-100 dark:border-rose-800/30 bg-rose-50/60 dark:bg-rose-900/10" : "border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/80 dark:bg-emerald-900/15"}`}>
                <td colSpan={3} className={`px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest ${totalBalance > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  Balance Due
                </td>
                <td className={`px-4 py-2.5 text-right text-sm font-extrabold ${totalBalance > 0 ? "text-rose-700 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300"}`}>
                  Rs. {totalBalance.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </TableCard>

    </div>
  );
};

/* ── Summary card ── */
const summaryColorMap: Record<string, { bg: string; icon: string; value: string; bar: string }> = {
  indigo:  { bg: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60",  icon: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/30",   value: "text-slate-800 dark:text-slate-100", bar: "from-indigo-500 to-blue-500"   },
  emerald: { bg: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60",  icon: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30", value: "text-emerald-700 dark:text-emerald-400", bar: "from-emerald-500 to-green-400" },
  rose:    { bg: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60",  icon: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/30",                 value: "text-rose-700 dark:text-rose-400",     bar: "from-rose-500 to-pink-400"    },
};

function SummaryCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  const c = summaryColorMap[color] ?? summaryColorMap.indigo;
  return (
    <div className={`relative overflow-hidden rounded-2xl border ${c.bg} shadow-sm dark:shadow-none p-4`}>
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${c.bar}`} />
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">{label}</p>
          <p className={`text-lg font-extrabold leading-none ${c.value}`}>{value}</p>
        </div>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${c.icon}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ── Table card ── */
const tableColorMap: Record<string, { label: string; icon: string }> = {
  indigo:  { label: "text-indigo-600 dark:text-indigo-400",  icon: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/30"  },
  emerald: { label: "text-emerald-600 dark:text-emerald-400", icon: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30" },
};

function TableCard({ icon, title, color = "indigo", children }: { icon: React.ReactNode; title: string; color?: string; children: React.ReactNode }) {
  const c = tableColorMap[color] ?? tableColorMap.indigo;
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60">
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border ${c.icon}`}>
          {icon}
        </span>
        <h2 className={`text-xs font-bold uppercase tracking-widest ${c.label}`}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default BillDetailsPage;