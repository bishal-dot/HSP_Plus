export interface ProgressNoteRequest{
    MrNo: string;
}

export interface ProgressNoteResponse{
    unkid: string;
    date: string | null;
    DISCIPLINE: string | null;
    PATIENTPROGRESSNOTE: string | null;
    USER: string | null;
}