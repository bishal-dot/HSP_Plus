export interface SsdReferRequest {
    patientCode: number;
    patientRegCode: number;
    patientReferId: number;
    totalAmount: number;
    isVerified: number;
    referDetails: SsdReferDetails[];
}

export interface SsdReferDetails {
    donorCode: number;
    amount: number;
    remarks: string;
}

export interface SsdReferResponse {
    StatusCode: number;
    StatusMessage: string;
}