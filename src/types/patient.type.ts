import { Address } from "./address.types";

// request and response of OPD Patients
export interface patientResponse{
    FirstName: string;
    LastName: string;
    Sex: string;
    TokenNo: string;
    AdmissionNo: string;
    Mobile: string;
    PatientCode: string;
    DeptCode: string;
    ConsultantCode: string;
    consultant: string;
    FacultyName: string;
    Age: string;
    PatientCategory: number;
}
export interface patientRequest{
    patientCode?: string;
    opdCode?: string;
    pageNumber?: number;
    pageSize?: number;
}

export interface opdPatientRequest {
    deptcode: number;
    centerid: number;
    showall: string;
    date: string | null;       // allow null
    datefrom: string | null;   // allow null
    dateTo: string | null;     // allow null
    PATIENTNAME?: string;
    MRNO?: string;
}

export interface opdPatientDayWiseRequest{
    DTODAY: string;
    centerid: number;
    deptcode: number;
    consultantcode: number;
}

export interface opdPatientDayWiseResponse{
    RegNo: string;
    Tokenid: number;
    TokenNo: string;
    MRNo: string;
    PatientName: string;
    Age: string;
    Gender: string;
    ContactNo: string;
    DOB_N: string;
    DOB_E: string;
    ConsultingDoctor: string;
    BlockedBy: string;
    CheckIn: string;
    WaitingTime: string;
    VisitMode: string;
    Address: string;
    Diagnosis: string;
    Gphreporting: string;
    District: string;
    Wardno: string;
    VDC_municipality: string;
    FacultyName: string;
}

export interface opdPatientResponse{
    RegCode: number;
    PatientCode: string;
    PATIENTNAME: string;
    Age: string;
    ADDRESS: string;
    TokenNo: string;
    Date: string;
    VisitMode: string;
    BlockedBy: string;
    Mobile: string;
    Diagnosis: string;
}

// request and response of inPatient
export interface inPatientRequest{
    centerCode: string;
}
export interface inPatientResponse{
    PatientCode: string
    IPDCODE: number
    patientname: string
    Mobile: string
    AdmitDate: string   // ISO string from SQL
    ADDRESS: string
    Age: string
    ward: string
    wardName: string
    bedno: string
    // Diagnosis: string
    Gphreporting: string
}

// request and response of Discharged Patients
export interface dischargedPatientsRequest{
    DTFROM: string;
    dtto: string;
    patientname?: string;
    mrno?: string;
    centercode: string;
}

export interface dischargedPatientResponse{
    IPDCODE: number;
    Mrno: string;
    PATIENTNAME: string;
    ADDRESS: string;
    Age: string;
    Mobile: string;
    WARD: string;
    CONSULTANT: string;
    ADMITTEDTIME_E: string;
    ADMITTEDTIME_N: string;
    DISCHARGEDATE_E: string;
    DISCHARGEDATE_N: string;
    STAYDAYS: number;
}

export interface PatientCaseFormData {
  UnkID: number;
  FiscalYear?: string;
  RegCode?: number;
  MRNo?: string;
  ConsultantCode?: number;
  DeptCode?: number;
  CenterID?: number;
  PatientCode?: string;
  RegistrationDate?: string;
  PatientFullName?: string;
  PatientGardiansFullName?: string;
  IsPregnent?: string;
  TimeOfPregnent?: string;
  EthnicCode?: string;
  Age?: string;
  Gender?: string;
  MaritalStatus?: string;
  PastOccupation?: string;
  PresentOccupation?: string;
  StudentHighestClassPassed?: string;
  ContactNumber?: string;
  ContactPerson?: string;
  IsAnyMemberWithLeprosy?: string;
  PermenantAddress?: Address;
  TemporaryAddress?: Address;
  TypeofCase?: string;
  JD_Classification?: string;
  ModeOfDetection?: string;
  TypeOfPatientRegistration?: string;
  IsRefferedCounsling?: string;
  IsNerveFunctionAssesment?: string;
  IsProvideHealthEducation?: string;
  TypeOfLepraReaction?: string;
  DateOfReaction?: string;
  DateOfSTreatmentForReaction?: string;
  IsNeuritis?: string;
  DateOfNeuritis?: string;
  DateOfStartingTreatmentForNeuritis?: string;
  Ulcer?: string;
  DrugReaction?: string;
  MDTCompletionDate?: string;
  SkinSmearDate?: string;
  Biopsy?: string;
  BiopsyResult?: string;
  EyeDiagnosis?: string;
  HandDiagnosis?: string;
  FootDiagnosis?: string;
  EhfScoreDiagnosis?: string;
  WhoGradingScoreDiagnosis?: string;
  EyeRFT?: string;
  HandRFT?: string;
  FootRFT?: string;
  EhfScoreRFT?: string;
  WhoGradingScoreRFT?: string;
  SARIAdmissionDate?: string;
  SARIDischargeDate?: string;
  SALSAAdmissionDate?: string;
  SALSADischargeDate?: string;
  ContactNoOfPerson?: string;
  NameOfContactExam?: string;
  AgeOrSexOfContactPerson?: string;
  LeprosyDiagnosis?: string;
  NoOfDiagnosis?: string;
  ContactExaminationDate?: string;
  WayOfDeduction?: string;
  DeductedDate?: string;
  CRSPlace?: string;
  Remarks?: string;
  CurrentDate?: string;
  DateE?: string;
  DateN?: string;
  PermanentProvince?: string;
  PermanentDistrict?: string;
  PermanentMunicipality?: string;
  PermanentWard?: string;
  PermanentTole?: string;
  TemporaryProvince?: string;
  TemporaryDistrict?: string;
  TemporaryMunicipality?: string;
  TemporaryWard?: string;
  TemporaryTole?: string;
  ContactPersonName?: string;
  SkinSmearREarLobe?: string;
  SkinSmearLEarLobe?: string;
  SkinSmearRArm?: string;
  SkinSmearLThigh?: string;
  RelationalOne?: string;
  RelationalTwo?: string;
  Voluntarily?: string;
  Refered?: string;
  TodaysMajorProblem?: string;
}


export interface PatientServiceFormData {
    Fiscalyear?: string;
    TranNo?: number;
    Sno?: number;
    ServiceCode?: number;
    DeptCode?: number;
    Rate?: number;
    Discount?: number;
    Qty?: number;
    Amount?: number;
    TaxAmt?: number;
    Remarks?: string;
    C_datetime?: Date | string;
    centercode?: number;
}