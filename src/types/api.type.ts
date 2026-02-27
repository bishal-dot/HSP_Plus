export interface ApiRequest<T> {
    tokenNo : string;
    data?: T;
}
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

export interface RequiredApiRequest<T>{
    tokenNo : string;
    data: T;
}