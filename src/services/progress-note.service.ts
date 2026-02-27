import { DbParameter, QueryDefault } from "@/lib/db";
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