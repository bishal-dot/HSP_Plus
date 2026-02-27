"use client";

import { useAuthToken } from "@/context/AuthContext";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
  Calendar,
} from "lucide-react";
import { useLabRecords } from "../queries/labRecords.queries";

interface props {
  Patientcode: string;
}

const LaboratoryRecords: React.FC<props> = ({ Patientcode }) => {
  const { authToken } = useAuthToken();
  const { data: reports, isFetching, isError } = useLabRecords(authToken, Patientcode);

  if (isFetching) return <p>Loading lab records...</p>;
  if (isError) return <p>Failed to load lab records</p>;
  if (!reports || reports.length === 0) return <p>No lab records found</p>;

  console.log("Reports",reports);

  return (
    <div className="space-y-6">
      {reports.map((data, idx) => (
        <div key={data.TestTranId ?? idx} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          {/* ===== Header ===== */}
          <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-800">Laboratory Report</h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {data.CollectionDate_Eng}
                </span>
                <span className="flex items-center gap-1">
                  <FlaskConical size={14} />
                  {data.TestAlias}
                </span>
              </div>
            </div>

            <button className="flex items-center gap-2 text-blue-600 text-sm hover:underline">
              <FileText size={16} />
              View Full Report
            </button>
          </div>

          {/* ===== Body ===== */}
          <div className="p-6 space-y-8">
            <section className="space-y-4">
              {/* ===== Major Group ===== */}
              <h3 className="text-md font-semibold text-indigo-700 border-b pb-1">{data.Alias}</h3>
              <div className="border rounded-xl overflow-hidden">
                {/* Group Title */}
                <div className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                  {data.GroupName}
                </div>

                {/* Tests Table */}
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-2 text-left">Test</th>
                      <th className="px-4 py-2 text-center">Result</th>
                      <th className="px-4 py-2 text-center">Unit</th>
                      <th className="px-4 py-2 text-center">Reference</th>
                      <th className="px-4 py-2 text-center">Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.majorGroups && data.majorGroups.length > 0
                      ? data.majorGroups.map((test: any, tIdx: number) => (
                          <tr key={tIdx} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-2">{test.TestAlias}</td>
                            <td className="px-4 py-2 text-center font-medium">{test.Findingvalue}</td>
                            <td className="px-4 py-2 text-center">{test.Unit}</td>
                            <td className="px-4 py-2 text-center">{test.Referencerange}</td>
                            <td className="px-4 py-2 text-center">
                              {test.resultflag === "H" ? (
                                <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                                  <AlertTriangle size={14} /> High
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-green-600">
                                  <CheckCircle2 size={14} /> Normal
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      : (
                          <tr className="border-t hover:bg-gray-50">
                            <td className="px-4 py-2">{data.TestAlias}</td>
                            <td className="px-4 py-2 text-center font-medium">{data.Findingvalue}</td>
                            <td className="px-4 py-2 text-center">{data.Unit}</td>
                            <td className="px-4 py-2 text-center">{data.Referencerange}</td>
                            <td className="px-4 py-2 text-center">
                              {data.resultflag === "H" ? (
                                <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                                  <AlertTriangle size={14} /> High
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-green-600">
                                  <CheckCircle2 size={14} /> Normal
                                </span>
                              )}
                            </td>
                          </tr>
                        )}
                  </tbody>

                </table>
              </div>
            </section>

            {/* ===== Footer Notes ===== */}
            {(data.comment || data.footnote) && (
              <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-700 space-y-1">
                {data.comment && (
                  <p>
                    <span className="font-semibold">Comment:</span> {data.comment}
                  </p>
                )}
                {data.footnote && (
                  <p>
                    <span className="font-semibold">Footnote:</span> {data.footnote}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LaboratoryRecords;
