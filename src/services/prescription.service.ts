import { Con_ExecuteAsync, Con_GetAsync, Con_QueryAsync, DbParameter, GetAsync, QueryDefault } from "@/lib/db";
import { ApiRequest, ApiResponse } from "@/types/api.type";
import { masterDbResponseWithToken } from "@/types/masterDb.type";
import { MedicineListRequest, MedicineListResponse, PrescriptionHistoryRequest, PrescriptionHistoryResponse } from "@/types/prescription.type";
import sql from "mssql";

export async function getPrescriptionHistory(request: ApiRequest<PrescriptionHistoryRequest>):Promise<ApiResponse<PrescriptionHistoryResponse[]>> {
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
          FROM GPHmd_LIVE.dbo.Prescription_Master
          WHERE PatientCode = @PatientCode
          ORDER BY c_datetime DESC;
        `;

      const dbparams: DbParameter[] = [{ name: 'PatientCode', type: sql.NVarChar(50), value: request.data?.PatientCode }];
    
      const result = await Con_QueryAsync<PrescriptionHistoryResponse>(dbResponseItem.dbLink, query, dbparams);
  
      return {
        success: true,
        message: 'Success',
        data: result
      }

    }catch(e){
      console.log(e)
      return {
        success: false,
        message: 'Invalid request'
    }
  }
}

export async function createOrUpdatePrescription(tokenNo: string, body: any) {
  try{
    // 1. Validaete token and get dbLink
    const tokenParams: DbParameter[] = [
      { name: 'TokenNo', type: sql.NVarChar(150), value: tokenNo }
    ];
    const dbResponse = await GetAsync<masterDbResponseWithToken>('usp_Pos_S_LogininfoByTokenNo', tokenParams);
    if( dbResponse.length === 0 ) {
      return {
        success: false,
        message: 'Invalid request'
      };
    }
    const dbResponseItem = dbResponse[0];
    if( !(dbResponseItem.dbLink !== "" && tokenNo !== "") ) {
      return {
        success: false,
        message: 'Invalid request'
      };
    }

    const { dbLink, loginid, lcode } = dbResponseItem;

    // Add this map at the top of the file
    const DURATION_CODE: Record<string, string> = {
      "Day(s)":   "1",
      "Week(s)":  "2",
      "Month(s)": "3",
    };
    // 2. Insert or update
       const params: DbParameter[] = [
        { name: "UnkId",            type: sql.NVarChar(120), value: String(body.UnkId ?? 0) },
        { name: "PatientCode",      type: sql.NVarChar(120), value: body.PatientCode },
        { name: "RegNo",            type: sql.NVarChar(120), value: body.RegNo },
        { name: "PrescriptionType", type: sql.NVarChar(120), value: body.PrescriptionType ?? "Regular" },
        { name: "DrugsCode",        type: sql.NVarChar(120), value: String(body.DrugsCode) },  // item ID
        { name: "Unit",             type: sql.NVarChar(120), value: "" },                       // SP fetches this
        { name: "Batch",            type: sql.NVarChar(120), value: body.Batch    ?? "" },
        { name: "Expiry",           type: sql.NVarChar(120), value: body.Expiry   ?? "" },
        { name: "Dose",             type: sql.Float(), value: body.Dose },
        { name: "Frequency",        type: sql.NVarChar(120), value: String(body.Frequency ?? 0) },
        { name: "Route",            type: sql.NVarChar(120), value: String(body.Route ?? "") },
        { name: "StartDate",        type: sql.NVarChar(120), value: body.StartDate },
        { name: "Duration",         type: sql.NVarChar(120), value: String(body.Duration ?? 1) },
        { name: "DurationOn",       type: sql.NVarChar(120), value: DURATION_CODE[body.DurationOn ?? "1"] },  // 1/2/3
        { name: "TotalQty",         type: sql.NVarChar(120), value: "0" },                       // SP calculates
        { name: "Instruction",      type: sql.NVarChar(120), value: body.Instruction    ?? "" },
        { name: "AdditionalInstr",  type: sql.NVarChar(120), value: body.AdditionalInstr ?? "" },
        { name: "Date_Eng",         type: sql.NVarChar(120), value: body.StartDate },
        { name: "Date_Nep",         type: sql.NVarChar(120), value: body.Date_Nep ?? "" },
        { name: "C_userId",         type: sql.NVarChar(120), value: String(loginid ?? "") },     // ← from token
        { name: "c_datetime",       type: sql.NVarChar(120), value: new Date().toISOString() },
        { name: "Centerid",         type: sql.NVarChar(120), value: String(body.Centerid ?? 0) },   // ← from token
        { name: "Deptcode",         type: sql.NVarChar(120), value: String(lcode) },   // ← from token
        { name: "PatientName",      type: sql.NVarChar(120), value: body.PatientName },
        { name: "Age",              type: sql.NVarChar(120), value: String(body.Age) },
        { name: "Gender",           type: sql.NVarChar(120), value: body.Gender },
        { name: "dept",             type: sql.NVarChar(120), value: body.dept },
        { name: "itemtype",         type: sql.NVarChar(120), value: body.itemtype  ?? "" },
        { name: "DoctorName",       type: sql.NVarChar(120), value: body.DoctorName },
      ];

      const result = await Con_ExecuteAsync(dbLink, "GPHmd_LIVE.dbo.Usp_CreateNewPrescription", params);
      return { success: true, data: result};
  } catch(e: any){
    console.log(e)
    return {
      success: false,
      message: 'Invalid request'
  };
  }
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
        'GPHmd_LIVE.dbo.GetMedicineList',
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
