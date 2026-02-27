import sql from "mssql";
import { Con_GetAsync, GetAsync } from "@/lib/db";
import { masterDbResponseWithToken } from "@/types/masterDb.type";
import { DbParameter } from "@/lib/db";
import { ApiRequest, ApiResponse } from "@/types/api.type";
import { SsdReferRequest, SsdReferResponse } from "@/types/refer.type";

export async function savePatientSsdRefer(request: ApiRequest<SsdReferRequest>): Promise<ApiResponse<SsdReferResponse>> {
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

    if (!request.data.patientReferId) {
        return { success: false, message: 'Refer ID is required' };
    }

    if (!request.data.referDetails || !Array.isArray(request.data.referDetails) || request.data.referDetails.length === 0) {
        return { success: false, message: 'At least one refer item is required' };
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

        const table = new sql.Table('SsdReferOfPatient');
        table.columns.add('DonorCode', sql.Int);
        table.columns.add('Amount', sql.Decimal(18, 4));
        table.columns.add('Remarks', sql.NVarChar(sql.MAX));
        request.data.referDetails.forEach(item => {
            table.rows.add(
                item.donorCode,
                item.amount,
                item.remarks || ""
            );
        });

        const dbParams: DbParameter[] = [
            { name: 'patientCode', type: sql.Int(), value: request.data.patientCode },
            { name: 'regCode', type: sql.Int(), value: request.data.patientRegCode },
            { name: 'referId', type: sql.Int(), value: request.data.patientReferId },
            { name: 'totalAmount', type: sql.Decimal(18, 4), value: request.data.totalAmount },
            { name: 'isVerified', type: sql.Int(), value: request.data.isVerified },
            { name: 'TokenNo', type: sql.NVarChar(150), value: request.tokenNo },
            { name: 'referItems', type: sql.TVP('SsdReferOfPatient'), value: table },
        ];

        const upsertSsdRefer = await Con_GetAsync<SsdReferResponse>(
            dbResponseItem.dbLink,
            'usp_SSD_IU_SsdReferredPatient',
            dbParams
        );

        if (upsertSsdRefer.length > 0 && upsertSsdRefer[0].StatusCode == 200) {
            return {
                success: true,
                message: 'Data saved successfully',
                data: upsertSsdRefer[0]
            };
        } else {
            return {
                success: false,
                message: 'Failed to save refer data'
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


