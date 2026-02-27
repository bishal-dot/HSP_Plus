import { Con_GetAsync, Con_QueryAsync, DbParameter, QueryDefault } from "@/lib/db";
import { PrescriptionHistoryResponse } from "@/types/prescription.type";
import sql from "mssql";

export async function getPrescriptionHistory(PatientCode:string):Promise<PrescriptionHistoryResponse[]> {
   const query = `
        SELECT
            CAST(UnkId AS INT)                 AS UnkId,
            PatientCode,
            RegNo,
            PrescriptionType,
            DrugsCode,
            Unit,
            Batch,
            Expiry,
            TotalQty                           AS Quantity,     -- varchar -> mapped
            Dose,
            Frequency,
            Route,
            StartDate,
            Duration,
            DurationOn                         AS TimePeriod,   
            Instruction,
            AdditionalInstr,
            CONVERT(VARCHAR, Date_Eng, 111)    AS Date_Eng,
            CONVERT(VARCHAR, Date_Nep, 111)    AS Date_Nep,
            C_userId,
            CONVERT(VARCHAR, c_datetime, 111)  AS c_datetime,
            Centerid,
            Deptcode,
            PatientName,
            Age,
            Gender,
            dept,
            itemtype,
            DoctorName,
            Amount
        FROM dbo.Prescription_Master
        WHERE PatientCode = @PatientCode
        ORDER BY c_datetime DESC;
        `;

    const params: DbParameter[] = [{ name: 'PatientCode', type: sql.NVarChar(50), value: PatientCode }];
    return await QueryDefault<PrescriptionHistoryResponse>(query, params);
}

export const PrescriptionQueries = {
  getPrescriptionHistory,
  createPrescription: async (params: DbParameter[] | any) => {
    return Con_GetAsync("Usp_CreateNewPrescription", params);
  },
}

export const createOrUpdatePrescription = async (params: any) => {
  return await PrescriptionQueries.createPrescription(params);
}

