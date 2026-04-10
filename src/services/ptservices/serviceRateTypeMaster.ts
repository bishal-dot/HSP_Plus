import { QueryDefault } from "@/lib/db";

export async function serviceRateTypeMaster() {
    const query = `
        SELECT RateCode as Code, RateName as label FROM GPHmd_Live.dbo.hsp_ServiceRateTypeMaster ORDER BY RateName
    `;
    return await QueryDefault(query);
}