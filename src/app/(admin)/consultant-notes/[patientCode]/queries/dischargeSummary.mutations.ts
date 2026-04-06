import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface InsertDischargePayload {
  authToken: string;
  MrNO: string;
  IPDCode: string;
  userId: number;
  DischargeType: string;
  PreOPDiagnosis?: string;
  Diagnosis: string;
  CO?: string;
  HOPI?: string;
  PastHistory?: string;
  PersonalHistory?: string;
  OE?: string;
  GC?: string;
  PICCLED?: string;
  SE?: string;
  CHEST?: string;
  CBS?: string;
  CNS?: string;
  PA?: string;
  OEFreeBox?: string;
  OTFinding?: string;
  COHStay?: string;
  TDHSFreeBox?: string;
  TDHSOTNote?: string;
  TDHSPTNote?: string;
  TDHSTNote?: string;
  AOE?: string;
  AGC?: string;
  APICCLED?: string;
  ASE?: string;
  ACHEST?: string;
  ACBS?: string;
  ACNS?: string;
  APA?: string;
  AODOTNote?: string;
  AODPTNote?: string;
  AODSTNote?: string;
  AODNursingNote?: string;
  RX?: string;
  ADVICE?: string;
  C_DATE?: string;
  c_user?: string;
  m_DATE?: string;
  m_user?: string;
}

const insertDischargeSummary = async (payload: InsertDischargePayload) => {
  const { authToken, ...body } = payload;

  const response = await fetch("/api/inpatients/dischargeSummary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message ?? "Failed to insert discharge record");
  }
  return response.json();
};

export const useInsertDischargeSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertDischargeSummary,
    onSuccess: (_, variables) => {
      // Invalidate the summary query so the viewer refreshes after insert
      queryClient.invalidateQueries({ queryKey: ["dischargeSummary", variables.MrNO] });
    },
  });
};