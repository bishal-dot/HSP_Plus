import { useMutation, useQueryClient } from "@tanstack/react-query";

interface InsertOperationPayload {
  authToken: string | null;
  MrNO: string;
  IPDCode: string;
  Otdate: string;
  Starttime?: string;
  EndTime?: string;
  SkinIncisionTime?: string;
  SkinClosureTime?: string;
  PreOPDiagnosis?: string;
  PostOpDiagnosis?: string;
  Diagnosis?: string;
  Op_Preposed?: string;
  Op_Executed: string;
  Surgery?: string;
  SurgeryGroup?: string;
  OTProcedure?: string;
  anesthesiaGroup?: string;
  BloodLoss?: string;
  Counts?: string;
  IIUsage?: string;
  Closure?: string;
  CultureSensitivity?: string;
  BIOPSY?: string;
  Histopathology?: string;
  IMPLANT?: string;
  REMARKS?: string;
  consultantcode?: number;
  consultantname?:string;
  memberRole?:number
}

const insertOperationRecord = async (payload: InsertOperationPayload) => {
  const { authToken, ...body } = payload;

  const response = await fetch("/api/inpatients/operationrecord", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message ?? "Failed to insert operation record");
  }

  return response.json();
};

export const useInsertOperationRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertOperationRecord,
    onSuccess: (_, variables) => {
      // Invalidate the operation records query so the viewer refreshes after insert
      queryClient.invalidateQueries({ queryKey: ["operationRecord", variables.MrNO] });
    },
  });
};