import { DbParameter, QueryDefault } from "@/lib/db";
import { DischargeSummaryType } from "@/types/dischargesummary.types";
import sql from "mssql";

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