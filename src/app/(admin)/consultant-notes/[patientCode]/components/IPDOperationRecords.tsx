"use client";

import { useAuthToken } from "@/context/AuthContext";
import { useOperationRecord } from "../queries/operaationrecord.queries";
import { CircleOff, CalendarDays, User, Stethoscope } from "lucide-react";

interface props {
  PatientCode: string;
}

const IPDOperationRecords: React.FC<props> = ({ PatientCode }) => {
  const { authToken } = useAuthToken();

  const { data: operationRecords, error, isLoading } =
    useOperationRecord(authToken, PatientCode ?? null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-500">
        Loading operation records...
      </div>
    );
  }

  if (!operationRecords || operationRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 mt-20 text-gray-600">
        <CircleOff size={60} />
        <span className="text-xl font-semibold">No Operation Records</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {operationRecords.map((op) => (
        <div
          key={op.OperationId}
          className="bg-white border rounded-xl shadow-sm p-6 space-y-4"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-3">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <Stethoscope size={18} />
              {op.Op_Executed || "Operation"}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CalendarDays size={16} />
              {op.Date}
            </div>
          </div>

          {/* Surgeon */}
          <div className="flex items-center gap-2 text-gray-700">
            <User size={16} />
            <span className="font-medium">Surgeon:</span>
            {op.TeamMember}
          </div>

          {/* Diagnosis */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="font-semibold text-gray-700">
                Pre Operation Diagnosis
              </span>
              <p className="text-gray-600 text-sm mt-1">
                {op.PreOPDiagnosis || "-"}
              </p>
            </div>

            <div>
              <span className="font-semibold text-gray-700">
                Post Operation Diagnosis
              </span>
              <p className="text-gray-600 text-sm mt-1">
                {op.PostOpDiagnosis || "-"}
              </p>
            </div>
          </div>

          {/* Operation Notes */}
          {op.Diagnosis && (
            <div>
              <span className="font-semibold text-gray-700">
                Operation Notes
              </span>

              <div className="bg-gray-50 border rounded-lg p-3 mt-2 text-sm whitespace-pre-line text-gray-700">
                {op.Diagnosis}
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-600 pt-2 border-t">
            <div>
              <span className="font-medium">Group:</span> {op.Group}
            </div>

            <div>
              <span className="font-medium">Role:</span> {op.MemberRole}
            </div>

            <div>
              <span className="font-medium">User:</span> {op.user}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IPDOperationRecords;