import { DbParameter } from "@/lib/db";
import sql from "mssql";
import { QueryDefault } from "@/lib/db";

export async function getServicesByType(serviceCode: number) {
    const query = `
      SELECT ServiceCode, ServiceName, Alias FROM GPHmd_Live.dbo.hsp_ServiceMaster WHERE ServiceType = @serviceCode
      ORDER BY ServiceName
    `;
    const params: DbParameter[] = [
        { name: 'serviceCode', type: sql.Int(), value: serviceCode }
    ];
    return await QueryDefault(query, params);
}