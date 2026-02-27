import { Con_GetAsync, DbParameter, GetAsync } from "@/lib/db";
import { ApiRequest } from "@/types/api.type";
import { BillMasterRequest, BillMasterResponse, ReceiptPaymentForBillMasterRequest, ReceiptPaymentForBillMasterResponse } from "@/types/billDetails.types";
import { masterDbResponseWithToken } from "@/types/masterDb.type";
import sql from "mssql";

export async function fetchbillMasterFromDb(request:ApiRequest<BillMasterRequest>) {
    try{
        const params: DbParameter[] = [
            { name: 'TokenNo', type: sql.NVarChar(150), value: request.tokenNo },
        ];

        const dbResponse = await GetAsync<masterDbResponseWithToken>(
            `usp_Pos_S_LogininfoByTokenNo`,
            params
        );
        if( dbResponse.length === 0 ) {
            return {
                success: false,
                message: 'Invalid request'
            };
        }

        const dbResponseItem = dbResponse[0];
        if(!dbResponseItem.dbLink || !request.tokenNo) {
            return {
                success: false,
                message: 'Invalid database connection'
            };
        }
        const dbParams: DbParameter[] = [
            {name : 'IPDCode', type: sql.BigInt(), value: request.data?.IPDCode},
            {name: 'IsDateWise', type: sql.Bit(), value: request.data?.IsDateWise ? 1 : 0},
        ];
        console.log("DbParams:",dbParams);

        const billDetailsResponse = await Con_GetAsync<BillMasterResponse>(
            dbResponseItem.dbLink,
            'spBillMaster',
            dbParams
        );

        return {
            success: true,
            data: billDetailsResponse
        };
    }catch{
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
}

export async function fetchIPDReceiptPaymentForBillMasterFromDb(request: ApiRequest<ReceiptPaymentForBillMasterRequest>) {
    try{
        const params: DbParameter[] = [
            { name: 'TokenNo', type: sql.NVarChar(150), value: request.tokenNo },
        ];

        const dbResponse = await GetAsync<masterDbResponseWithToken>(
            `usp_Pos_S_LogininfoByTokenNo`,
            params
        );
        if( dbResponse.length === 0 ) {
            return {
                success: false,
                message: 'Invalid request'
            };
        }

        const dbResponseItem = dbResponse[0];
        if(!dbResponseItem.dbLink || !request.tokenNo) {
            return {
                success: false,
                message: 'Invalid database connection'
            };
        }
        const dbParams: DbParameter[] = [
            {name: 'IPDCode', type: sql.BigInt(), value: request.data?.IPDCode},
        ];

        const IPDReceiptPaymentResponse = await Con_GetAsync<ReceiptPaymentForBillMasterResponse>(
            dbResponseItem.dbLink,
            `spIPDReceiptPaymentForBillMaster`,
            dbParams
        );

        return {
            success: true,
            data: IPDReceiptPaymentResponse
        };
 
    }catch{
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
}