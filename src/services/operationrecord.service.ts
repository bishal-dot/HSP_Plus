import { Con_GetAsync, DbParameter, GetAsync, QueryDefault } from "@/lib/db";
import { ApiRequest } from "@/types/api.type";
import { masterDbResponseWithToken } from "@/types/masterDb.type";
import { OperationRecordType, OperationRecordTypeRequest } from "@/types/operationrecord.types";
import sql from "mssql";


export async function fetchOperationRecordFromDb(request: ApiRequest<OperationRecordTypeRequest>){
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
            { name: 'mrno', type: sql.NVarChar(50), value: request.data?.mrno }
        ];

        const operationRecordResponse = await Con_GetAsync<OperationRecordTypeRequest[]>(
            dbResponseItem.dbLink,
            'GPHmd_LIVE.dbo.IPD_GetOperationRecordBYMRNO',
            dbParams
        );
        return{
            success: true,
            data: operationRecordResponse
        }
    }catch(e){
        return{
            success: false,
            message: 'Something went wrong'
        };
    }
}

 export async function getOperationRecordFromDb(MrNO: string): Promise<OperationRecordType[]> {
    const query = `
        SELECT CAST(UnkCode AS INT) AS UnkCode,
        OperationId,
        Centercode,
        MrNO,
        IPDCode,
        Otdate,
        Starttime,
        EndTime,
        PreOPDiagnosis,
        PostOpDiagnosis,
        Diagnosis,
        Surgery,
        SurgeryGroup,
        OTProcedure,
        Closure,
        CultureSensitivity,
        BIOPSY,
        IMPLANT,
        DEPARTMENT,
        REMARKS,
        C_DATE,
        C_USER,
        DE_ACTIVE,
        m_DATE,
        m_user,
        SubDepartment,
        ServiceCodeId,
        Op_Preposed
        FROM IPD_OperationRecordMaster
        WHERE MrNO = @MrNO
        ORDER BY C_DATE DESC
    `;

    const params: DbParameter[] = [
        {name: 'MrNO', value: MrNO, type: sql.NVarChar(50)}
    ];

    return await QueryDefault<OperationRecordType>(query, params);
 }

