import { Con_GetAsync, DbParameter, GetAsync, QueryDefault } from "@/lib/db";
import { ApiRequest } from "@/types/api.type";
import { DischargeSummaryType, DischargeSummaryTypeRequest, DischargeSummaryTypeResponse } from "@/types/dischargesummary.types";
import { masterDbResponseWithToken } from "@/types/masterDb.type";
import sql from "mssql";

export async function fetchDischargeSummaryFromDb(request: ApiRequest<DischargeSummaryTypeRequest>) {
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
            {name: 'Mrno', value: request.data?.Mrno, type: sql.NVarChar(50)}
        ]

        const dischargeSummaryResponse = await Con_GetAsync<DischargeSummaryTypeResponse>(
            dbResponseItem.dbLink,
            'IPD_GetDischargeRecordMasterByMrNo',
            dbParams
        );
        return{
            success: true,
            data: dischargeSummaryResponse
        }
    } catch (error) {
        return{
            success: false,
            message: 'Something went wrong'
        }
    }
}
export async function getDischargeSummaryFromDb(MrNO: string): Promise<DischargeSummaryType[]> {
    const query = `
        SELECT CAST(UnkCode AS INT) AS UnkCode,
        DischargeID,
        Centercode,
        MrNO,
        IPDCode,
        DischargeType,
        PreOPDiagnosis,
        Diagnosis,
        CO,
        HOPI,
        PastHistory,
        PersonalHistory,
        OE,
        GC,
        PICCLED,
        SE,
        CHEST,
        CBS,
        CNS,
        PA,
        OTFinding,
        COHStay,
        AOE,
        AGC,
        APICCLED,
        ASE,
        ACHEST,
        ACBS,
        ACNS,
        APA,
        RX,
        ADVICE,
        C_DATE,
        DE_ACTIVE,
        m_DATE,
        m_user,
        OEFreeBox,
        TDHSFreeBox,
        TDHSOTNote,
        TDHSPTNote,
        TDHSTNote,
        AODOTNote,
        AODPTNote,
        AODSTNote,
        AODNursingNote
        FROM IPD_DischargeRecordMaster
        WHERE MrNO = @MrNO
        ORDER BY C_DATE DESC
    `;

    const params: DbParameter[] = [
        {name: 'MrNO', value: MrNO, type: sql.NVarChar(50)}
    ];

    return await QueryDefault<DischargeSummaryType>(query, params);
}