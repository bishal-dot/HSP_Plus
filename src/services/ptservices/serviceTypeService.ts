import { QueryDefault } from "@/lib/db";
import sql from "mssql";

export async function getServiceMasterFromDb() {
    const serviceMaster = await QueryDefault(
    `
        SELECT TypeId AS ServiceCode, Alias AS ServiceType FROM GPHmd_Live.dbo.hsp_ServiceType ORDER BY Alias  
    `);
    return serviceMaster
}