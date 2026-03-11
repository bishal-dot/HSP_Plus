import { Con_GetAsync, DbParameter, GetAsync, QueryDefault } from "@/lib/db";
import { ApiRequest } from "@/types/api.type";
import { masterDbResponseWithToken } from "@/types/masterDb.type";
import { ProgressNoteRequest, ProgressNoteResponse } from "@/types/progress-note.types";
import sql from "mssql";

export interface ProgressNote {
  UNKID: number;            // bigint → number
  MRNO: string | null;
  WARDCODE: string | null;
  BEDCODE: string | null;
  DATE: string | null;      // smalldatetime → string (comes as ISO)
  TIME: string | null;
  DISCIPLINE: string | null;
  PATIENTPROGRESSNOTE: string | null;
  COMMENTS: string | null;
  C_DATE: string | null;    // smalldatetime → string
  C_USER: number | null;    // int → number
  CENTERCODE: number | null;
  DEPTCODE: number | null;
  IPDCODE: string | null;   // varchar(20)
}

export async function getProgressNoteByMRNO(MRNO: string): Promise<ProgressNote[]> {
      const query = `
        SELECT 
        CAST(UNKID AS BIGINT) AS UNKID,
        MRNO,
        WARDCODE,
        BEDCODE,
        DATE,
        TIME,
        DISCIPLINE,
        PATIENTPROGRESSNOTE,
        COMMENTS,
        C_DATE,
        C_USER,
        CENTERCODE,
        DEPTCODE,
        IPDCODE
        FROM DOCTOR_PATIENTPROGRESSNOTE
        WHERE MRNO = @MRNO
        ORDER BY C_DATE DESC
    `;
    
    const params: DbParameter[] = [
        {name: 'MRNO', value: MRNO, type: sql.NVarChar(50)}
    ];

    return await QueryDefault<ProgressNote>(query, params);
}


export async function getProgressNoteByMRNOFromDb(request: ApiRequest<ProgressNoteRequest>) {
  try{
     const params: DbParameter[] = [
        { name: 'TokenNo', type: sql.NVarChar(150), value: request.tokenNo },
    ];

    const dbResponse = await GetAsync<masterDbResponseWithToken>('usp_Pos_S_LogininfoByTokenNo', params);
    if( dbResponse.length === 0 ) {
        return {
            success: false,
            message: 'Invalid request'
        };
    }

    const dbResponseItem = dbResponse[0];
    if( !(dbResponseItem.dbLink !== "" && request.tokenNo !== "") ) {
        return {
            success: false,
            message: 'Invalid request'
        };
    }

    const dbParams: DbParameter[] = [
        {name: 'MrNo', value: request.data?.MrNo, type: sql.NVarChar(50)}
    ]

    const progressNote = await Con_GetAsync<ProgressNoteResponse>(
        dbResponseItem.dbLink,
        'Get_Hsp_ProgressNote',
        dbParams
    );

    return {
        success: true,
        data: progressNote
    };
  }catch(error: any) {
    return {
        success: false,
        message: error.message
    };
  }
}