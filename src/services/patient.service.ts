'use server';
import { Con_GetAsync, DbParameter, GetAsync, QueryDefault } from '@/lib/db';
import { ApiRequest, ApiResponse, RequiredApiRequest } from '@/types/api.type';
import { masterDbResponseWithToken } from '@/types/masterDb.type';
import { dischargedPatientResponse, dischargedPatientsRequest, inPatientRequest, inPatientResponse, opdPatientDayWiseRequest, opdPatientDayWiseResponse, opdPatientRequest, opdPatientResponse, patientRequest, patientResponse } from '@/types/patient.type';
import sql from 'mssql';

export async function fetchPatientInfo(request: RequiredApiRequest<patientRequest>): Promise<ApiResponse<patientResponse[]>> {
    // if (!request.data?.opdCode?.trim() || !request.data.patientCode?.trim()) {
    //     return {
    //         success: false,
    //         message: 'Invalid request'
    //     };   
    // }
     if (!request.data) {
        return {
            success: false,
            message: 'Invalid request data'
        };
    }

    try {

        const params: DbParameter[] = [
            { name: 'TokenNo', type: sql.NVarChar(150), value: request.tokenNo },
        ];
            
        const dbResponse = await GetAsync<masterDbResponseWithToken>(
            'usp_Pos_S_LogininfoByTokenNo',
            params
        );
        if (dbResponse.length === 0) {
            return {
                success: false,
                message: 'Invalid request'
            };
        }
        
        const dbResponseItem = dbResponse[0];
        // if (!(dbResponseItem.dbLink !== "" && request.tokenNo !== "")) {
        //     return {
        //         success: false,
        //         message: 'Invalid request'
        //     };
        // }
        if (!dbResponseItem.dbLink || !request.tokenNo) {
            return {
                success: false,
                message: 'Invalid database connection'
            };
        }

        const dbParams: DbParameter[] = [
            { name: 'OpdCode', type: sql.NVarChar(50), value: request.data.opdCode || null },
            { name: 'PageNumber', type: sql.Int(), value:request.data.pageNumber || 1 },
            { name: 'PageSize', type: sql.Int(), value: request.data.pageSize || 10 },
        ];
        const patientDbResponse = await Con_GetAsync<patientResponse>(
            dbResponseItem.dbLink,
            'usp_SSD_S_PatientInfo',
            dbParams
        );

        
          let filteredPatients = patientDbResponse;

        if (request.data.patientCode?.trim()) {
        filteredPatients = filteredPatients.filter(p =>
            p.PatientCode
            .toLowerCase()
            .includes(request.data.patientCode!.toLowerCase())
        );
        }

        return {
        success: true,
        message: filteredPatients.length
            ? 'Data retrieved successfully'
            : 'No patients found',
        data: filteredPatients
        };

    } catch {
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
}

export async function fetchOPDpatientAll(request: RequiredApiRequest<opdPatientRequest>): Promise<ApiResponse<opdPatientResponse[]>> {
    try{
        const params: DbParameter[] = [
            { name: 'TokenNo', type: sql.NVarChar(150), value: request.tokenNo },
        ];
            
        const dbResponse = await GetAsync<masterDbResponseWithToken>(
            'usp_Pos_S_LogininfoByTokenNo',
            params
        );
        if (dbResponse.length === 0) {
            return {
                success: false,
                message: 'Invalid request'
            };
        }
        
        const dbResponseItem = dbResponse[0];
        // if (!(dbResponseItem.dbLink !== "" && request.tokenNo !== "")) {
        //     return {
        //         success: false,
        //         message: 'Invalid request'

        //     };
        // }
        if (!dbResponseItem.dbLink || !request.tokenNo) {
            return {
                success: false,
                message: 'Invalid database connection'
            };
        }

        const parseDate = (d: string | null | undefined) => {
            if (!d) return null;
            const dt = new Date(d);
            return isNaN(dt.getTime()) ? null : dt;
        };

        const dbParams: DbParameter[] = [
            { name: 'deptcode', type: sql.Int(), value: request.data.deptcode }, 
            { name: 'centerid', type: sql.Int(), value: 1 }, 
            { name: 'showall', type: sql.NVarChar(5),  value: request.data.showall},
            { name: 'date', type: sql.SmallDateTime(), value: parseDate(request.data.date) },
            { name: 'datefrom', type: sql.SmallDateTime(), value: parseDate(request.data.datefrom) },
            { name: 'dateTo', type: sql.SmallDateTime(), value: parseDate(request.data.dateTo) },
            { name: 'PATIENTNAME', type: sql.VarChar(100), value: request.data.PATIENTNAME || '' },
            { name: 'MRNO', type: sql.VarChar(50), value: request.data.MRNO || '' },
        ];

        const patientDbResponse = await Con_GetAsync<opdPatientResponse>(
            dbResponseItem.dbLink,
            'USP_OPDPT_ALL',
            dbParams
        );
        return {
            success: true,
            message: patientDbResponse.length
                ? 'Data retrieved successfully'
                : 'No patients found',
            data: patientDbResponse
        };
    } catch {
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
}

export async function fetchOPDPatientsDayWise(request: RequiredApiRequest<opdPatientDayWiseRequest>): Promise<ApiResponse<opdPatientDayWiseResponse[]>>{
    try{
        const params: DbParameter[] = [
            { name: 'TokenNo', type: sql.NVarChar(150), value: request.tokenNo },
        ];
            
        const dbResponse = await GetAsync<masterDbResponseWithToken>(
            'usp_Pos_S_LogininfoByTokenNo',
            params
        );
        if (dbResponse.length === 0) {
            return {
                success: false,
                message: 'Invalid request'
            };
        }
        
        const dbResponseItem = dbResponse[0];
        // if (!(dbResponseItem.dbLink !== "" && request.tokenNo !== "")) {
        //     return {
        //         success: false,
        //         message: 'Invalid request'
        //     };    
        // }
        if (!dbResponseItem.dbLink || !request.tokenNo) {
            return {
                success: false,
                message: 'Invalid database connection'
            };
        }
        const dbParams: DbParameter[] = [
            { name: 'DTODAY', type: sql.SmallDateTime(), value: request.data.DTODAY || new Date().toISOString().split('T')[0] },
           {
             name: "centerid",
            type: sql.Int(),
            value: 1,
        },
        {
            name: "deptcode",
            type: sql.Int(),
            value: request.data.deptcode,
        },
        {
            name: "consultantcode",
            type: sql.Int(),
            value: request.data.consultantcode,
        },
        ];
        const patientDbResponse = await Con_GetAsync<opdPatientDayWiseResponse>(
            dbResponseItem.dbLink,
            'usp_OPDPT_DAYWISE',
            dbParams
        );
        return {
            success: true,
            message: patientDbResponse.length
                ? 'Data retrieved successfully'
                : 'No patients found',
            data: patientDbResponse
        };        
    } catch {
        return {
            success: false,
            message: 'Something went wrong'
        }
    }
        
}


export async function fetchInpatientInfo(request: RequiredApiRequest<inPatientRequest>): Promise<ApiResponse<inPatientResponse[]>> {

    try {
        const params: DbParameter[] = [
            { name: 'TokenNo', type: sql.NVarChar(150), value: request.tokenNo },
        ];
            
        const dbResponse = await GetAsync<masterDbResponseWithToken>(
            'usp_Pos_S_LogininfoByTokenNo',
            params
        );
        if (dbResponse.length === 0) {
            return {
                success: false,
                message: 'Invalid request'
            };
        }
        
        const dbResponseItem = dbResponse[0];
        // if (!(dbResponseItem.dbLink !== "" && request.tokenNo !== "")) {
        //     return {
        //         success: false,
        //         message: 'Invalid request'
        //     };
        // }
        if (!dbResponseItem.dbLink || !request.tokenNo) {
            return {
                success: false,
                message: 'Invalid database connection'
            };
        }

        const dbParams: DbParameter[] = [
            { name: 'centerCode', type: sql.NVarChar(50), value: request.data.centerCode },

        ];
         const inPatientDbResponse = await Con_GetAsync<inPatientResponse>(
            dbResponseItem.dbLink,
            'NURSE_ACTIVEIPPATIENT',
            dbParams
        );

        return {
        success: true,
        message: inPatientDbResponse.length
            ? 'Data retrieved successfully'
            : 'No patients found',
        data: inPatientDbResponse
        };

    } catch {
        return {
            success: false,
            message: 'Something went wrong'
        }
}
}

export async function fetchDischargedPatientInfo(request:RequiredApiRequest<dischargedPatientsRequest>): Promise<ApiResponse<dischargedPatientResponse[]>> {
    try{
        const params: DbParameter[] = [
            { name: 'TokenNo', type: sql.NVarChar(150), value: request.tokenNo },
        ];
            
        const dbResponse = await GetAsync<masterDbResponseWithToken>(
            'usp_Pos_S_LogininfoByTokenNo',
            params
        );
        if (dbResponse.length === 0) {
            return {
                success: false,
                message: 'Invalid request'
            };
        }
        const dbResponseItem = dbResponse[0];
        if (!dbResponseItem.dbLink || !request.tokenNo) {
            return {
                success: false,
                message: 'Invalid database connection'
            };
        }
         const dbParams: DbParameter[] = [
            { name: 'centercode', type: sql.NVarChar(50), value: request.data.centercode },
            { name: 'DTFROM', type: sql.SmallDateTime(), value: request.data.DTFROM },
            { name: 'dtto', type: sql.SmallDateTime(), value: request.data.dtto },
            { name: 'patientname', type: sql.NVarChar(50), value: request.data.patientname },
            {name: 'mrno', type: sql.NVarChar(50), value: request.data.mrno},

        ];
         const dischargedPatientResponse = await Con_GetAsync<dischargedPatientResponse>(
            dbResponseItem.dbLink,
            'NURSE_GETALLDISCHARGEPATIENTLIST',
            dbParams
        );

        return {
        success: true,
        message: dischargedPatientResponse.length
            ? 'Data retrieved successfully'
            : 'No patients found',
        data: dischargedPatientResponse
        };
    } catch{
        return {
            success: false,
            message: 'Something went wrong'
        }
    }
}


