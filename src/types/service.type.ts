export interface ServiceTypeResponse{
    typeId: number;
    typeName: string;
}

export interface ServiceResponse{
    ServiceCode: string;
    ServiceName: string;
    ServiceType: string;
    Rate: number;
}

export interface ServiceRequest{
    patientCategory: number;
}