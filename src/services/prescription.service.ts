import { Con_GetAsync, Con_QueryAsync, DbParameter, GetAsync, QueryDefault } from "@/lib/db";
import { ApiRequest } from "@/types/api.type";
import { masterDbResponseWithToken } from "@/types/masterDb.type";
import { MedicineListRequest, MedicineListResponse, PrescriptionHistoryResponse } from "@/types/prescription.type";
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

export async function getMedicineListFromDb(request: ApiRequest<MedicineListRequest>) {
    try{
      const params: DbParameter[] = [
        { name: 'TokenNo', type: sql.NVarChar(150), value: request.tokenNo }
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
        { name: 'ItemName', value: request.data?.ItemName, type: sql.NVarChar(50) },
        { name: 'CenterId', value: request.data?.CenterId, type: sql.BigInt() },
        { name: 'DeptCode', value: request.data?.DeptCode, type: sql.BigInt() },
        { name: 'PatientCode', value: request.data?.PatientCode, type: sql.NVarChar(100) },
        { name: 'C_User', value: request.data?.C_User, type: sql.BigInt()}
      ];

      const medicineResponse = await Con_GetAsync<MedicineListResponse>(
        dbResponseItem.dbLink,
        'GetMedicineList',
        dbParams
      );
      return{
        success: true,
        data: medicineResponse
      }
    } catch (error) {
      return{
        success: false,
        message: 'Something went wrong'
      }
    }
}
