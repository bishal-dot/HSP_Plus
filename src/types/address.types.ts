export interface Province{
    name: string;
    value: string;
    districts: District[];
}
export interface District{
    name: string;
    value: string;
    municipalities: Municipality[];
}
export interface Municipality{
    name: string;
    value: string;
}

export interface Address{
    province: string;
    district: string;
    municipality: string;
    ward: string;
    tole: string;
}