export interface BillMasterRequest{
    IPDCode: number,
    IsDateWise: boolean,
    Dtfrom?: string,
    Dtto?: string
}

export interface BillMasterResponse{
    Code: string,
    IPDCode: number,
    tDateE: string,
    tDateN: string,
    ServiceCode: number,
    ServiceName: string,
    ServiceTypename: string,
    Rate: number,
    Qty: number,
    Amount: number
    TranNO: number
}

export interface ReceiptPaymentForBillMasterRequest{
    IPDCode: number
}

export interface ReceiptPaymentForBillMasterResponse{
    ID:number,
    Date_E:string,
    Date_N:string,
    Particular:string,
    Amount:number,
    Remarks:string
}