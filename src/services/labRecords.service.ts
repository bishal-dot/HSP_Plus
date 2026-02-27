import { Con_GetAsync, DbParameter, GetAsync } from "@/lib/db";
import { ApiRequest } from "@/types/api.type";
import { labReportDataRequest, labReportsResponse } from "@/types/labRecords.type";
import { masterDbResponseWithToken } from "@/types/masterDb.type";
import sql from "mssql";

export async function fetchLabRecordsFromDb(request:ApiRequest<labReportDataRequest>) {
    try{
        const params: DbParameter[] = [
            { name: 'TokenNo', type: sql.NVarChar(150), value: request.tokenNo },
        ];

        const dbResponse = await GetAsync<masterDbResponseWithToken>(
            'usp_Pos_S_LogininfoByTokenNo',
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
            { name: 'Patientcode', type: sql.NVarChar(50), value: request.data?.Patientcode}
        ];
        const labReportDataResponse = await Con_GetAsync<labReportsResponse>(
            dbResponseItem.dbLink,
            'Lab_GetAllLabDataForConsultant',
            dbParams
        );
        return{
            success: true,
            message: labReportDataResponse.length
            ? 'Data retrivrd successfully' 
            : 'No data found',
            data: labReportDataResponse
        };
    } catch{
        return{
            success: false,
            message: 'Something went wrong'
        };
    }
}