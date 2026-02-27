import { Con_GetAsync, DbParameter, GetAsync } from "@/lib/db";
import { ApiRequest, RequiredApiRequest } from "@/types/api.type";
import { consultantNotesRequest, consultantNotesResponse } from "@/types/consultant-notes.type";
import { masterDbResponseWithToken } from "@/types/masterDb.type";
import sql from "mssql";

export async function fetchConsultantNotesFromDb(request:ApiRequest<consultantNotesRequest>) {
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
            { name: 'PATIENTCODE', type: sql.NVarChar(50), value: request.data?.PATIENTCODE }
        ];
        const consultantNoteResponse = await Con_GetAsync<consultantNotesResponse>(
            dbResponseItem.dbLink,
            'GET_CONSULTANTNOTE_BY_PATIENT',
            dbParams
        );
        return {
            success: true,
            message: consultantNoteResponse.length
            ? 'Data retrieved successfully'
            : 'No patients found',
            data: consultantNoteResponse
        };
    } catch{
        return {
            success: false,
            message: 'Something went wrong',
        };
    }
    
}