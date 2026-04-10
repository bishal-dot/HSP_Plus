import { Con_GetAsync, DbParameter, GetAsync } from "@/lib/db";
import { ApiRequest, RequiredApiRequest } from "@/types/api.type";
import { masterDbResponseWithToken } from "@/types/masterDb.type";
import { ServiceRqByMrnoRequest, ServiceRqByMrnoResponse } from "@/types/service.type";
import sql from "mssql";

export async function getServiceRequestByMrno(request:RequiredApiRequest<ServiceRqByMrnoRequest>){
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
            { name: 'mrno', type: sql.NVarChar(50), value: request.data?.mrno },
            { name: 'centercode', type: sql.NVarChar(10), value: request.data?.centercode || '1'},
        ];

        const serviceRequestResponse = await Con_GetAsync<ServiceRqByMrnoResponse>(
            dbResponseItem.dbLink,
            `Doctor_GetServiceRequestbyMrNO`,
            dbParams
        );

        return {
            success: true,
            data: serviceRequestResponse
        };
    }catch(e:any) {
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
}