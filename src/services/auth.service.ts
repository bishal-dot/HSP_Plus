'use server';
import { Con_GetAsync, DbParameter, ExecuteAsync, GetAsync, QueryDefault } from '@/lib/db';
import { ApiRequest, ApiResponse } from '@/types/api.type';
import { LoginRequest, LoginResponse } from '@/types/login.type';
import { masterDbResponse } from '@/types/masterDb.type';
import sql from 'mssql';

export async function userLoginService(request: ApiRequest<LoginRequest>): Promise<ApiResponse<LoginResponse>> {
    if (!request.data?.initial?.trim() || !request.data.userName?.trim()) {
        return {
            success: false,
            message: 'Invalid login request'
        };
    }

    try {
        const params: DbParameter[] = [
            { name: 'Initial', type: sql.VarChar(255), value: request.data.initial },
            { name: 'InitialURL', type: sql.VarChar(255), value: "inf" },
        ];
            
        const dbResponse = await GetAsync<masterDbResponse>(
            'usp_S_DbLinkwithTokenByInitialwithURL',
            params
        );
        
        if (dbResponse.length === 0) {
            return {
                success: false,
                message: 'Invalid login request'
            };
        }
        
        const dbResponseItem = dbResponse[0];
        if (!(dbResponseItem.dbLink !== "" && dbResponseItem.TokenNo !== "")) {
            return {
                success: false,
                message: 'Please use proper login method'
            };
        }

        const dbParams: DbParameter[] = [
            { name: 'UserName', type: sql.VarChar(255), value: request.data.userName },
            { name: 'Password', type: sql.VarChar(255), value: request.data.userPass },
            { name: 'MachineName', type: sql.VarChar(255), value: "" },
            { name: 'TokenNo', type: sql.VarChar(255), value: dbResponseItem.TokenNo },
        ];
        
        const loginResponse = await Con_GetAsync<LoginResponse>(
            dbResponseItem.dbLink,
            'usp_HSP_WEB_Login',
            dbParams
        );

        if (loginResponse.length > 0 && loginResponse[0].status === "200") {
            const userParams: DbParameter[] = [
                { name: 'UserID', type: sql.Int(), value: loginResponse[0].userId },
            ];

            // Query tb_User table with correct column name: consalentcode
            const userDetails = await QueryDefault<{
                isconsaltent: boolean | null;
                consalentcode: string | null;  //  varchar(50) in DB
            }>(
                `SELECT isconsaltent, consalentcode FROM tb_User WHERE UserID = @UserID`, 
                userParams
            );

            const updateSessionParams: DbParameter[] = [
                { name: 'TokenNo', type: sql.NVarChar(150), value: dbResponseItem.TokenNo },
                { name: 'UserID', type: sql.Int(), value: loginResponse[0].userId },
            ];
            await ExecuteAsync('usp_U_UpdateTokenByUserID', updateSessionParams);

            //  Parse consalentcode (it's varchar, might need to convert to int)
            let consultantCode = 0;
            if (userDetails.length > 0 && userDetails[0].consalentcode) {
                const parsed = parseInt(userDetails[0].consalentcode);
                consultantCode = isNaN(parsed) ? 0 : parsed;
            }

            const finalResponse: LoginResponse = {
                ...loginResponse[0],
                consultantCode: consultantCode,
                isConsultant: userDetails.length > 0 ? (userDetails[0].isconsaltent || false) : false
            };

            // console.log('Login successful', finalResponse);

            return {
                success: true,
                message: 'Login successful',
                data: finalResponse
            };
        } else {
            return {
                success: false,
                message: 'Invalid username or password'
            };
        }
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
}

export async function userLoginUsingOrgIdandUserIdService(request: ApiRequest<LoginRequest>): Promise<ApiResponse<LoginResponse>> {
    if (request.data?.orgId == null || request.data?.userId == null) {
        return {
            success: false,
            message: 'Invalid login request'
        };
    }

    try {
        const params: DbParameter[] = [
            { name: 'Initial', type: sql.VarChar(100), value: request.data.orgId.toString() },
            { name: 'machineName', type: sql.VarChar(150), value: "inf" },
        ];
            
        const dbResponse = await GetAsync<masterDbResponse>(
            'usp_S_DbLinkwithTokenByInitial',
            params
        );
        
        if (dbResponse.length === 0) {
            return {
                success: false,
                message: 'Invalid login request'
            };
        }
        
        const dbResponseItem = dbResponse[0];
        if (!(dbResponseItem.dbLink !== "" && dbResponseItem.TokenNo !== "")) {
            return {
                success: false,
                message: 'Please use proper login method'
            };
        }
        
        const dbParams: DbParameter[] = [
            { name: 'UserId', type: sql.VarChar(255), value: request.data.userId.toString() },
            { name: 'TokenNo', type: sql.VarChar(255), value: dbResponseItem.TokenNo },
        ];

        const loginResponse = await Con_GetAsync<LoginResponse>(
            dbResponseItem.dbLink,
            'usp_HSP_WEB_LoginUsingOrgIdandUserId',
            dbParams
        );
        
        if (loginResponse.length > 0 && loginResponse[0].status === "200") {
            
            // Also get consultant info for this login method
            const userParams: DbParameter[] = [
                { name: 'UserID', type: sql.Int(), value: loginResponse[0].userId },
            ];

            const userDetails = await QueryDefault<{
                isconsaltent: boolean | null;
                consalentcode: string | null;
            }>(
                `SELECT isconsaltent, consalentcode FROM tb_User WHERE UserID = @UserID`, 
                userParams
            );
            
            const updateSessionParams: DbParameter[] = [
                { name: 'TokenNo', type: sql.NVarChar(150), value: dbResponseItem.TokenNo },
                { name: 'UserID', type: sql.Int(), value: loginResponse[0].userId },
            ];
            await ExecuteAsync('usp_U_UpdateTokenByUserID', updateSessionParams);
            
            let consultantCode = 0;
            if (userDetails.length > 0 && userDetails[0].consalentcode) {
                const parsed = parseInt(userDetails[0].consalentcode);
                consultantCode = isNaN(parsed) ? 0 : parsed;
            }

            const finalResponse: LoginResponse = {
                ...loginResponse[0],
                consultantCode: consultantCode,
                isConsultant: userDetails.length > 0 ? (userDetails[0].isconsaltent || false) : false
            };
            
            return {
                success: true,
                message: 'Login successful',
                data: finalResponse
            };
        } else {
            return {
                success: false,
                message: 'Invalid username or password'
            };
        }
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: 'Something went wrong'
        };
    }
}