import { DbParameter, QueryDefault } from "@/lib/db";
import sql from "mssql";

export async function getSeviceRate(serviceCode: number, rateType: number, consultantcode?: number, taxPercent?: number) {
    const query = `
        SELECT Rate FROM GPHmd_Live.dbo.hsp_ServiceRateDetail
        WHERE ServiceCode = @serviceCode AND RateType = @rateType
    `;

    const params: DbParameter[] = [
        { name: 'serviceCode', type: sql.Int(), value: serviceCode },
        { name: 'rateType', type: sql.Int(), value: rateType }
    ];

    const result: { Rate: string }[] = await QueryDefault(query, params);
    if (result.length === 0) return 0;

    let rate = parseFloat(result[0].Rate);
    if(taxPercent) rate += rate * (1 + (taxPercent / 100));
    return rate;
}