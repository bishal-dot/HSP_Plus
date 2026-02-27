
export interface SsdEstimateRequest {
    patientCode: string;
    patientRegCode: string;
    totalAmount: number;
    isVerified: number;
    estimateDetails: SsdEstimateDetails[];
}

export interface SsdEstimateDetails {
    serviceTypeCode: number;
    serviceType: string;
    serviceCode: number;
    serviceName: string;
    quantity: number;
    rate: number;
    amount: number;
    remarks: string;
}

export interface SsdEstimateResponse {
    StatusCode: number;
    StatusMessage: string;
}

export interface SsdReferredResponse {
    FirstName: string;
    LastName: string;
    Sex: string;
    Mobile: string;
    DeptCode: string;
    ConsultantCode: string;
    Age: string;
    PatientCategory: number;
    PatientCode: string;
    RegCode: string;
    TotalAmount: number;
    RefferredStatus: number;
    EstimateId: number;
    SsdRefferredNumber: number;
    SsdRefferredAmount: number;
}
