export interface PrescriptionHistoryRequest{
    PatientCode: string;
}
export interface PrescriptionHistoryResponse {
  UnkId: number;
  PatientCode: string;
  RegNo: string;
  PrescriptionType: string;
  DrugsCode: string;
  Unit: number;
  Batch: string;
  Expiry: string;

  Quantity: string;        // TotalQty is varchar(50)
  Dose: string;
  Frequency: number;
  Route: number;

  StartDate: string;       // smalldatetime → string
  Duration: number;
  TimePeriod: string;      // DurationOn

  Instruction: string;
  AdditionalInstr: string;

  Date_Eng: string;
  Date_Nep: string;
  C_userId: number;
  c_datetime: string;

  Centerid: number;
  Deptcode: number;

  PatientName: string;
  Age: string;
  Gender: string;
  // dept: string;
  itemtype: number;

  DoctorName: string;
  Amount: number;
}

export interface Medication{
  id: string;
  drugName: string;
  dose: string;
  frequency: string;
  route: string;
  startDate: string;
  duration: string;
  timePeriod: string;
  instructions: string[];
  remarks: string;
  medicineId: number;
  freqCode?: number;
  routeCode?: string;
}

export interface PrescriptionFormRequest{
  patientCode: string;
  patientName?: string;
  regNo?: string;
  age?: string;
  gender?: string;
  doctorName?: string;
  dept?: string;
}

export interface MedicineListRequest{
  ItemName: string | null;
  CenterId: number | null;
  DeptCode: number | null;
  PatientCode: string | null;
  C_User: number | null;
}

export interface MedicineListResponse{
  itemid: string;
  Particular: string;
  Name: string;
}