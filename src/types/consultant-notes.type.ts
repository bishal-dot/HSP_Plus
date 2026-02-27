export interface consultantNotesRequest{
    PATIENTCODE: string
}
export interface consultantNotesResponse {
    UnkID: number;
    RegCode: string;
    visittype: 'OPD' | 'IPD';
    ConsultantCode: string;
    BlockedBy: string;
    DeptCode: string;
    PatientCode: string;
    VisitType: number; // 0 = OPD, 1 = IPD
    DateE: string; // or Date if you parse it
    DateN: string; // or Date
    PresentComplaints: string;
    PreviousHistory: string;
    MajorIllness: string;
    GenExamination: string;
    Diagnosis: string;
    Allergies: string;
    TreatmentPlan: string;
    Recommendation: string;
    FacultyName: string | null;
    CENTERNAME: string | null; // always 'GPH CENTER'
    iCDNAME: string | null;
    Morbiditycode: string | null;
    Morbidityalias: string | null;
}
