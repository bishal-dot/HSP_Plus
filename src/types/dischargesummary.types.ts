export interface DischargeSummaryType {
  UnkCode: number;
  DischargeID: number;
  Centercode: number;
  MrNO: string;
  IPDCode: string | null;
  DischargeType: string | null;

  PreOPDiagnosis: string | null;
  Diagnosis: string | null;
  CO: string | null;
  HOPI: string | null;
  PastHistory: string | null;
  PersonalHistory: string | null;

  OE: string | null;
  GC: string | null;
  PICCLED: string | null;
  SE: string | null;
  CHEST: string | null;
  CBS: string | null;
  CNS: string | null;
  PA: string | null;

  OTFinding: string | null;
  COHStay: string | null;

  AOE: string | null;
  AGC: string | null;
  APICCLED: string | null;
  ASE: string | null;
  ACHEST: string | null;
  ACBS: string | null;
  ACNS: string | null;
  APA: string | null;

  RX: string | null;
  ADVICE: string | null;

  C_DATE: string | null;      // smalldatetime → string
  DE_ACTIVE: boolean | null;  // bit → boolean
  m_DATE: string | null;

  c_user: number | null;
  m_user: number | null;

  OEFreeBox: string | null;
  TDHSFreeBox: string | null;
  TDHSOTNote: string | null;
  TDHSPTNote: string | null;
  TDHSTNote: string | null;

  AODOTNote: string | null;
  AODPTNote: string | null;
  AODSTNote: string | null;
  AODNursingNote: string | null;
}