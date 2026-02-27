'use server';

import sql from 'mssql';
import { Con_GetAsync, DbParameter, GetAsync } from "@/lib/db";
import { ApiRequest, ApiResponse } from "@/types/api.type";
import { SsdEstimateDetails, SsdEstimateRequest, SsdEstimateResponse, SsdReferredResponse } from "@/types/estimate.type";
import { masterDbResponseWithToken } from '@/types/masterDb.type';
import { patientRequest } from '@/types/patient.type';

export async function savePatientSsdEstimate(request: ApiRequest<SsdEstimateRequest>): Promise<ApiResponse<SsdEstimateResponse>> {
    if (!request.data) {
        return { success: false, message: 'Missing request data' };
    }

    if (!request.tokenNo?.trim()) {
        return { success: false, message: 'Invalid authentication token' };
    }

    if (!request.data.patientCode) {
        return { success: false, message: 'Patient code is required' };
    }

    if (!request.data.patientRegCode) {
        return { success: false, message: 'Registration code is required' };
    }

    if (!request.data.estimateDetails || !Array.isArray(request.data.estimateDetails) || request.data.estimateDetails.length === 0) {
        return { success: false, message: 'At least one estimate item is required' };
    }

    try {
        const params: DbParameter[] = [
            { name: 'TokenNo', type: sql.NVarChar(150), value: request.tokenNo },
        ];

        const dbResponse = await GetAsync<masterDbResponseWithToken>(
            'usp_Pos_S_LogininfoByTokenNo',
            params
        );
        if (dbResponse.length === 0) {
            return {
                success: false,
                message: 'Unauthorized.'
            };
        }

        const dbResponseItem = dbResponse[0];
        if (!(dbResponseItem.dbLink !== "" && request.tokenNo !== "")) {
            return {
                success: false,
                message: 'Session expired. Please login again.'
            };
        }

        const table = new sql.Table('SsdEstimateOfPatient');
        table.columns.add('ServiceTypeCode', sql.Int);
        table.columns.add('ServiceCode', sql.Int);
        table.columns.add('Quantity', sql.Decimal(18, 4));
        table.columns.add('Rate', sql.Decimal(18, 4));
        table.columns.add('Amount', sql.Decimal(18, 4));
        table.columns.add('Remarks', sql.NVarChar(sql.MAX));
        request.data.estimateDetails.forEach(item => {
            table.rows.add(
                item.serviceTypeCode,
                item.serviceCode,
                item.quantity,
                item.rate,
                item.amount,
                item.remarks || null
            );
        });

        const dbParams: DbParameter[] = [
            { name: 'patientCode', type: sql.NVarChar(100), value: request.data.patientCode },
            { name: 'regCode', type: sql.NVarChar(100), value: request.data.patientRegCode },
            { name: 'totalAmount', type: sql.Decimal(18, 4), value: request.data.totalAmount },
            { name: 'isVerified', type: sql.Int(), value: request.data.isVerified },
            { name: 'TokenNo', type: sql.NVarChar(150), value: request.tokenNo },
            { name: 'estimateItems', type: sql.TVP('SsdEstimateOfPatient'), value: table },
        ];

        const upsertSsdEstimate = await Con_GetAsync<SsdEstimateResponse>(
            dbResponseItem.dbLink,
            'usp_SSD_IU_SsdPatientEstimate',
            dbParams
        );

        if (upsertSsdEstimate.length > 0 && upsertSsdEstimate[0].StatusCode == 200) {
            return {
                success: true,
                message: 'Data saved successfully',
                data: upsertSsdEstimate[0]
            };
        } else {
            return {
                success: false,
                message: 'Failed to save estimate data'
            };
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
}




export async function fetchRefferedList(request: ApiRequest<null>): Promise<ApiResponse<SsdReferredResponse[]>> {

    if (!request.tokenNo.trim()) {
        return {
            success: false,
            message: 'Invalid request'
        };
    }

    try {
        const params: DbParameter[] = [
            { name: 'TokenNo', type: sql.NVarChar(150), value: request.tokenNo },
        ];

        const dbResponse = await GetAsync<masterDbResponseWithToken>(
            'usp_Pos_S_LogininfoByTokenNo',
            params
        );
        if (dbResponse.length === 0) {
            return {
                success: false,
                message: 'Invalid request'
            };
        }

        const dbResponseItem = dbResponse[0];

        if (!(dbResponseItem.dbLink !== "" && request.tokenNo !== "")) {
            return {
                success: false,
                message: 'Invalid request'
            };
        }

        const dbParams: DbParameter[] = [
            { name: 'TokenNo', type: sql.NVarChar(150), value: request.tokenNo },
        ];
        const dbRefferredResponse = await Con_GetAsync<SsdReferredResponse>(
            dbResponseItem.dbLink,
            'usp_SSD_S_RefferredListForConsultant',
            dbParams
        );
        if (dbRefferredResponse.length > 0) {
            return {
                success: true,
                message: 'Data retrieved successfully',
                data: dbRefferredResponse
            };
        } else {
            return {
                success: false,
                message: 'No service data found'
            };
        }
    } catch (err) {
        console.error(err);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
}




export async function fetchEstimatedDetails(request: ApiRequest<patientRequest>): Promise<ApiResponse<SsdEstimateDetails[]>> {

    if (!request.tokenNo.trim()) {
        return {
            success: false,
            message: 'Invalid request'
        };
    }

    try {
        const params: DbParameter[] = [
            { name: 'TokenNo', type: sql.NVarChar(150), value: request.tokenNo },
        ];

        const dbResponse = await GetAsync<masterDbResponseWithToken>(
            'usp_Pos_S_LogininfoByTokenNo',
            params
        );
        if (dbResponse.length === 0) {
            return {
                success: false,
                message: 'Invalid request'
            };
        }

        const dbResponseItem = dbResponse[0];

        if (!(dbResponseItem.dbLink !== "" && request.tokenNo !== "")) {
            return {
                success: false,
                message: 'Invalid request'
            };
        }

        const dbParams: DbParameter[] = [
            { name: 'TokenNo', type: sql.NVarChar(150), value: request.tokenNo },
            { name: 'PatientCode', type: sql.NVarChar(100), value: request.data?.patientCode || "" },
            { name: 'RegCode', type: sql.NVarChar(100), value: request.data?.opdCode || "" },
        ];
        const dbRefferredResponse = await Con_GetAsync<SsdEstimateDetails>(
            dbResponseItem.dbLink,
            'usp_SSD_S_RefferredDetailsByPatientCodeandRegCode',
            dbParams
        );
        if (dbRefferredResponse.length > 0) {
            return {
                success: true,
                message: 'Data retrieved successfully',
                data: dbRefferredResponse
            };
        } else {
            return {
                success: false,
                message: 'No service data found'
            };
        }
    } catch (err) {
        console.error(err);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
}
