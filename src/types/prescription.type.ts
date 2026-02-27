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
  dept: string;
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

  freqCode?: number;
  routeCode?: number;
}

export interface PrescriptionFormRequest{
  patientCode: string;
  patientName: string;
  regNo: string;
  age: string;
  gender: string;
  doctorName: string;
}