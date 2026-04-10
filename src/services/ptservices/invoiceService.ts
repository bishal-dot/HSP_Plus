import { DbParameter } from "@/lib/db";
import sql from "mssql";
import { QueryDefault } from "@/lib/db";

export async function getNextTranNo() {
    const query = `
        SELECT ISNULL(MAX(TRANID), 0) + 1 AS NextTranNo FROM GPHmd_Live.dbo.HSP_INVOICEREQUESTMASTER
    `;
    const result: { NextTranNo: number }[] = await QueryDefault(query, []);
    const nextTranNo = result[0]?.NextTranNo || 1;
    return nextTranNo;
}

export async function insertInvoiceMaster(data: {
    TranNo: number;
    FiscalYear: string;
    PatientCode: string;
    OPDCode: string;
    Amount: number;
    DeptCode: number;
    CenterCode: number;
    UserCode: number;
    DATE_E: string;
    DATE_N: string;
    IsInvoiced: boolean;
    InvoiceNo: string;
    Remarks: string;
}) {
   const query = `
        INSERT INTO GPHmd_Live.dbo.HSP_INVOICEREQUESTMASTER
        (TRANID, FISCALYEAR, PATIENTCODE, OPDCODE, AMOUNT, DEPTCODE, CENTERCODE, 
         USERCODE, DATE_N, DATE_E, ISINVOICED, INVOICENO, REMARKS)
        VALUES
        (@TranNo, @FiscalYear, @PatientCode, @OPDCode, @Amount, @DeptCode, @CenterCode,
         @UserCode, @DATE_N, @DATE_E, @IsInvoiced, @InvoiceNo, @Remarks)
    `;
    const params: DbParameter[] = [
        { name: "TranNo",      type: sql.Int(),        value: data.TranNo },
        { name: "FiscalYear",  type: sql.VarChar(15),  value: data.FiscalYear },
        { name: "PatientCode", type: sql.VarChar(50),  value: data.PatientCode },
        { name: "OPDCode",     type: sql.VarChar(50),  value: data.OPDCode },
        { name: "Amount",      type: sql.Float(),      value: data.Amount },
        { name: "DeptCode",    type: sql.Int(),        value: data.DeptCode || 0 },
        { name: "CenterCode",  type: sql.Int(),        value: data.CenterCode },
        { name: "UserCode",    type: sql.Int(),        value: data.UserCode },
        { name: "DATE_N",      type: sql.VarChar(50),  value: data.DATE_N },
        { name: "DATE_E",      type: sql.VarChar(50),  value: data.DATE_E },
        { name: "IsInvoiced",  type: sql.Bit(),        value: data.IsInvoiced },
        { name: "InvoiceNo",   type: sql.VarChar(50),  value: data.InvoiceNo || "" },
        { name: "Remarks",     type: sql.VarChar(200), value: data.Remarks || "" },
    ];
    return await QueryDefault(query, params);
}

export async function insertInvoiceDetail(data:{
    TranNo: number;
    FiscalYear: string;
    Sno: number;
    ServiceCode: number;
    DeptCode: number;
    Rate: number;
    Discount: number;
    Qty: number;
    Amount: number;
    TaxAmt: number;
    Remarks: string;
    C_datetime: string;
    centercode: number;
}) {
    const query = `
       INSERT INTO GPHmd_Live.dbo.hsp_InvoiceRequestDetail
       (Fiscalyear, TranNo, Sno, ServiceCode, DeptCode, Rate, Discount, Qty, Amount, TaxAmt, Remarks, C_datetime, centercode)
       VALUES
       (@FiscalYear, @TranNo, @Sno, @ServiceCode, @DeptCode, @Rate, @Discount, @Qty, @Amount, @TaxAmt, @Remarks, @C_datetime, @centercode)
    `;

    const params: DbParameter[] = [
        { name: "Fiscalyear", type: sql.VarChar(15), value: data.FiscalYear },
        { name: "TranNo", type: sql.Int(), value: data.TranNo },
        { name: "Sno", type: sql.Int(), value: data.Sno },
        { name: "ServiceCode", type: sql.Int(), value: data.ServiceCode },
        { name: "DeptCode", type: sql.Int(), value: data.DeptCode || 0},
        { name: "Rate", type: sql.Float(), value: data.Rate },
        { name: "Discount", type: sql.Float(), value: data.Discount || 0 },
        { name: "Qty", type: sql.Float(), value: data.Qty },
        { name: "Amount", type: sql.Float(), value: data.Amount },
        { name: "TaxAmt", type: sql.Float(), value: data.TaxAmt || 0},
        { name: "Remarks", type: sql.VarChar(50), value: data.Remarks || ""},
        { name: "C_datetime", type: sql.VarChar(50), value: data.C_datetime || new Date().toISOString() },
        { name: "centercode", type: sql.Int(), value: data.centercode || 1 },
    ];

    return await QueryDefault(query, params);
}