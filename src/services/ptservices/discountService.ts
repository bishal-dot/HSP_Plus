import { DbParameter } from "@/lib/db";
import sql from "mssql";
import { QueryDefault } from "@/lib/db";

export async function calculateDiscount(serviceCode:number, rate: number, discountTypeId: number) {
    const query =  `
        SELECT DiscountValue
        FROM GPHmd_Live.dbo.hsp_DiscountTypeDetail
        WHERE DiscountTypeId = @discountTypeId AND ServiceCode = @serviceCode
    `;

    const params: DbParameter[] = [
        { name: 'discountTypeId', type: sql.Int(), value: discountTypeId },
        { name: 'serviceCode', type: sql.Int(), value: serviceCode }
    ];
    const result: { DiscountValue: number }[] = await QueryDefault(query, params);
    if(result.length === 0) return 0;
    return rate * (result[0].DiscountValue / 100);
}