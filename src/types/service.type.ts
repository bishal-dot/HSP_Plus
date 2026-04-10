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

export interface ServiceRqByMrnoRequest{
    mrno: string;
    centercode: string;
}

export interface ServiceRqByMrnoResponse{
    TRANID: number;
    trancodedaterequestby: string;
    DeptCode: number;
    ServiceName: string;
    Amount: number;
    requestby: string;
    Remarks: string;
    Status: string;
}