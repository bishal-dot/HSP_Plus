export interface LoginRequest {
    userId?: number;
    orgId?: number;
    gropupId?: number;
    userName?: string;
    logOnId?: string;
    userPass?: string;
    userMail?: string;
    module?: string;
    initial?: string;
}

export interface LoginResponse {
    tokenNo?: string;
    userId?: number;
    userName?: string;
    userGroupId?: number;
    status?: string;
    consultantCode?: number;      
    isConsultant?: boolean;
}