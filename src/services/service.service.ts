'use server';
import { Con_GetAsync, DbParameter, GetAsync } from '@/lib/db';
import { ApiRequest, ApiResponse } from '@/types/api.type';
import { masterDbResponseWithToken } from '@/types/masterDb.type';
import { ServiceTypeResponse, ServiceRequest, ServiceResponse } from '@/types/service.type';
import sql from 'mssql';

export async function fetchServiceTypes(request: ApiRequest<null>): Promise<ApiResponse<ServiceTypeResponse[]>> {
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

        const serviceDbResponse = await Con_GetAsync<ServiceTypeResponse>(
            dbResponseItem.dbLink,
            'usp_SSD_S_ServiceType',
        );

        if (serviceDbResponse.length > 0) {
            return {
                success: true,
                message: 'Data retrieved successfully',
                data: serviceDbResponse
            };
        } else {``
            return {
                success: false,
                message: 'No service types found'
            };
        }
    } catch {
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
}




export async function fetchServices(request: ApiRequest<ServiceRequest>): Promise<ApiResponse<ServiceResponse[]>> {

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
            { name: 'PatientCategory', type: sql.Int(), value: request.data?.patientCategory || 0 },
        ];
        const serviceDbResponse = await Con_GetAsync<ServiceResponse>(
            dbResponseItem.dbLink,
            'usp_SSD_S_Services',
            dbParams
        );

        if (serviceDbResponse.length > 0) {
            return {
                success: true,
                message: 'Data retrieved successfully',
                data: serviceDbResponse
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

