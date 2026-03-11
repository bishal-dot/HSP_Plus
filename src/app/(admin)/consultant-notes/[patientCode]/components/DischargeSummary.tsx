"use client";

import { useAuthToken } from "@/context/AuthContext";
import { useDischargeSummary } from "../queries/dischargeSummary.queries";
import {
  CircleOff,
  Calendar,
  Stethoscope,
  Pill,
  ClipboardList,
  FileText
} from "lucide-react";

interface Props {
  MrNO: string;
}

const IPDDischargeSummary: React.FC<Props> = ({ MrNO }) => {
  const { authToken } = useAuthToken();
  const { data: dischargeSummary, isLoading } = useDischargeSummary(authToken, MrNO);

  const formatList = (text: string) => {
    if (!text) return [];
    return text
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item !== "");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-600">
        Loading Discharge Summary...
      </div>
    );
  }

  if (!dischargeSummary || dischargeSummary.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 mt-20">
        <CircleOff size={70} className="text-slate-400" />
        <span className="text-2xl font-semibold text-slate-600">
          No Discharge Summary Available
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">

      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <FileText size={24} />
        Discharge Summary
      </h1>

      {dischargeSummary.map((summary: any, index: number) => (
        <div
          key={index}
          className="bg-white shadow-md rounded-xl border border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-slate-50 px-6 py-4 flex flex-wrap justify-between gap-4 border-b">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar size={18} />
              <span className="font-medium">Date:</span> {summary.Date}
            </div>

            <div className="text-slate-700">
              <span className="font-medium">IPD Code:</span> {summary.IPDCode}
            </div>

            <div className="text-green-700 font-semibold">
              {summary.DischargeType}
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">

            {/* Diagnosis */}
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
                <Stethoscope size={18} />
                Diagnosis
              </h3>
              <p className="text-slate-700">{summary.Diagnosis}</p>

              {summary.PreOPDiagnosis && (
                <p className="text-sm text-slate-500 mt-1">
                  Pre-Op Diagnosis: {summary.PreOPDiagnosis}
                </p>
              )}
            </div>

            {/* Medication */}
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
                <Pill size={18} />
                Medications (Rx)
              </h3>

              <ul className="list-disc ml-6 space-y-1 text-slate-700">
                {formatList(summary.RX).map((rx: string, i: number) => (
                  <li key={i}>{rx}</li>
                ))}
              </ul>
            </div>

            {/* Advice */}
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
                <ClipboardList size={18} />
                Advice
              </h3>

              <ul className="list-disc ml-6 space-y-1 text-slate-700">
                {formatList(summary.ADVICE).map((adv: string, i: number) => (
                  <li key={i}>{adv}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IPDDischargeSummary;