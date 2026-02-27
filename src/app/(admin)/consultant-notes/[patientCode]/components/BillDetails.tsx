"use client";

import React from "react";
import { Printer, Download } from "lucide-react";
import { useAuthToken } from "@/context/AuthContext";
import { useBillMasters, useBillPaymentReceipt } from "../queries/bill-details.queries";

interface props {
  PatientCode: string;
}

const BillDetailsPage: React.FC<props> = ({ PatientCode }) => {
  const { authToken } = useAuthToken();

  const { data: billMasters } = useBillMasters(authToken, PatientCode);
  const { data: billPaymentReceipt } = useBillPaymentReceipt(authToken, PatientCode);

  const totalBilled =
    billMasters?.reduce((total, bill) => total + bill.Amount, 0) ?? 0;

  const totalReceipt =
    billPaymentReceipt?.reduce((total, item) => total + item.Amount, 0) ?? 0;

  const totalBalance = totalBilled - totalReceipt;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-full mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            IPD Bill Details
          </h1>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 dark:text-slate-800 bg-white border rounded-xl shadow-sm hover:bg-gray-100 transition">
              <Printer size={16} />
              Print
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 transition">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Billed Details */}
        <div className="bg-white dark:bg-slate-800 border rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">
            Billed Services
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-600">
                  <th className="text-left p-3">ServiceType</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-center p-3">Qty</th>
                  <th className="text-right p-3">Rate</th>
                  <th className="text-right p-3">Amount</th>
                </tr>
              </thead>

              <tbody>
                {billMasters?.map((bill, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                    <td className="p-3">{bill.ServiceTypename}</td>
                    <td className="p-3">{bill.ServiceName}</td>
                    <td className="p-3 text-center">{bill.Qty}</td>
                    <td className="p-3 text-right">Rs. {bill.Rate.toFixed(2)}</td>
                    <td className="p-3 text-right font-medium">Rs. {bill.Amount.toFixed(2)}</td>
                  </tr>
                ))}

                <tr className="bg-gray-100 dark:bg-slate-700 font-semibold">
                  <td colSpan={4} className="p-3 text-right">
                    Total Billed
                  </td>
                  <td className="p-3 text-right dark:text-white">
                    Rs. {totalBilled.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Receipt Details */}
        <div className="bg-white border dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold dark:text-white text-gray-700 mb-4">
            Receipt / Deposit Details
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-600">
                  <th className="text-left p-3">Receipt No.</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-right p-3">Amount</th>
                </tr>
              </thead>

              <tbody>
                {billPaymentReceipt?.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                    <td className="p-3">{item.Remarks}</td>
                    <td className="p-3">{item.Date_E.split("T")[0]} / {item.Date_N}</td>
                    <td className="p-3">{item.Particular}</td>
                    <td className="p-3 text-right font-medium">
                      Rs. {item.Amount.toFixed(2)}
                    </td>
                  </tr>
                ))}

                <tr className="bg-gray-100 dark:bg-slate-700 font-semibold">
                  <td colSpan={3} className="p-3 text-right">
                    Total Receipt
                  </td>
                  <td className="p-3 text-right dark:text-white">
                    Rs. {totalReceipt.toFixed(2)}
                  </td>
                </tr>

                <tr className="bg-gray-200 dark:bg-slate-700 font-bold">
                  <td colSpan={3} className="p-3 text-right">
                    Total Balance
                  </td>
                  <td className="p-3 text-right dark:text-white">
                    Rs. {totalBalance.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default BillDetailsPage;

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  );
}