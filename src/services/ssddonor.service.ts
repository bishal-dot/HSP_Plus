import sql from "mssql";
import { Con_GetAsync, DbParameter, GetAsync } from "@/lib/db";
import { ApiRequest, ApiResponse } from "@/types/api.type";
import { ssdDonors } from "@/types/ssddonor.type";
import { masterDbResponseWithToken } from "@/types/masterDb.type";

export async function fetchSsdDonors(request: ApiRequest<null>): Promise<ApiResponse<ssdDonors[]>> {

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
        const serviceDbResponse = await Con_GetAsync<ssdDonors>(
            dbResponseItem.dbLink,
            'usp_SSD_S_DonorsList',
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
