import { DbParameter, QueryDefault } from "@/lib/db";

import sql from "mssql";

export interface ImagingRecords{
    UnkId: number;
    DocumentTitle: string;
    DocumentTag: string;
    URL: string;
    ImgDescription: string;
    TranDate: string;
    Consultantcode: string;
}

export async function getImagingRecords(patientCode: string): Promise<ImagingRecords[]> {

    const query = `SELECT 
        CAST(UnkId AS INT) AS UnkId,
        DocumentTitle,
        DocumentTag,
        URL,
        ImgDescription,
        Consultantcode,
        CONVERT(VARCHAR, TranDate, 111) AS TranDate
        FROM HSP_PATIENTDOCUMENTMASTER
        WHERE PatientCode = @patientCode
        AND ISNULL(IsLAborIMAGING, 0) = 1
        AND ISNULL(De_Active, 0) = 0
        ORDER BY TranDate DESC;`;
    
        
        const params: DbParameter[] = [
            { name: 'patientCode', type: sql.NVarChar(50), value: patientCode }
        ];
        
       return await QueryDefault<ImagingRecords>(
            query,
            params  
        );
       
}