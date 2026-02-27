export interface masterDbResponse {
    TokenNo: string;
    dbLink: string;
}

export interface masterDbResponseWithToken {
    lcode: number;
    dbLink: string;
    loginid: number;
}

export interface masterDbBranchResponse {
    id: number;
    OrganiationName: string;
}