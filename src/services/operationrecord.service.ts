import { DbParameter, QueryDefault } from "@/lib/db";
import { OperationRecordType } from "@/types/operationrecord.types";
import sql from "mssql";

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

