'use server';
import { DbParameter, GetAsync } from '@/lib/db';
import { ApiRequest, ApiResponse } from '@/types/api.type';
import { Branch } from '@/types/branch.type';
import { masterDbBranchResponse } from '@/types/masterDb.type';
import sql from 'mssql';


export async function getBranchService(request: ApiRequest<Branch>): Promise<ApiResponse<Branch[]>> {
    if (!request.data?.deptName?.trim()) {
        return {
            success: false,
            message: 'Invalid request'
        };
    }

    try {
        const params: DbParameter[] = [
            { name: 'Initial', type: sql.VarChar(255), value: request.data.deptName }, // 1,4,5
        ];

        const dbResponse = await GetAsync<masterDbBranchResponse>(
            'usp_HSP_R_S_GetBranchList',
            params
        );
        if (dbResponse.length === 0) {
            return {
                success: false,
                message: 'Invalid login request'
            };
        } else{
            return {
                success: true,
                message: 'Branches retrieved successfully',
                data: dbResponse.map(item => ({
                    deptId: item.id,
                    deptName: item.OrganiationName
                }))
            }
        }
    } catch {
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
}