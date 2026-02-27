import { getProgressNoteByMRNO } from "@/services/progress-note.service";
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { DbParameter, QueryDefault } from "@/lib/db";
import { Query } from "@tanstack/react-query";

export async function GET(
    request: NextRequest,
    { params }: { params: { MRNO: string } }
) {
    try {
        const { MRNO } = await params;
        const data = await getProgressNoteByMRNO(MRNO);
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Failed to fetch" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest,
    { params }: { params: { MRNO: string } }
) {
    try{
        const body = await request.json();
        const { UNKID, MRNO, WARDCODE, BEDCODE, DATE, TIME, DISCIPLINE, PATIENTPROGRESSNOTE, COMMENTS, C_USER, C_DATE, CENTERCODE, DEPTCODE, IPDCODE } = body;
        
    const query = `
    INSERT INTO DOCTOR_PATIENTPROGRESSNOTE
        (UNKID, MRNO, WARDCODE, BEDCODE, DATE, TIME, DISCIPLINE, PATIENTPROGRESSNOTE, COMMENTS, C_USER, C_DATE, CENTERCODE, DEPTCODE, IPDCODE)
    VALUES
        (@UNKID, @MRNO, @WARDCODE, @BEDCODE, @DATE, @TIME, @DISCIPLINE, @PATIENTPROGRESSNOTE, @COMMENTS, @C_USER, GETDATE(), @CENTERCODE, @DEPTCODE, @IPDCODE)
    `;
        const params: DbParameter[] = [
            {name: 'UNKID', value: UNKID, type: sql.BigInt()},
            {name: 'MRNO', value: MRNO, type: sql.NVarChar(50)},
            {name: 'WARDCODE', value: WARDCODE, type: sql.NVarChar(50)},
            {name: 'BEDCODE', value: BEDCODE, type: sql.NVarChar(50)},
            {name: 'DATE', value: new Date(DATE), type: sql.SmallDateTime()}, // convert string to date
            {name: 'TIME', value: TIME, type: sql.NVarChar(50)},
            {name: 'DISCIPLINE', value: DISCIPLINE, type: sql.NVarChar(sql.MAX)},
            {name: 'PATIENTPROGRESSNOTE', value: PATIENTPROGRESSNOTE, type: sql.NVarChar(sql.MAX)},
            {name: 'COMMENTS', value: COMMENTS, type: sql.NVarChar(sql.MAX)},
            {name: 'C_USER', value: C_USER, type: sql.Int()},
            {name: 'C_DATE', value: C_DATE, type: sql.DateTime()},
            {name: 'CENTERCODE', value: CENTERCODE, type: sql.Int()},
            {name: 'DEPTCODE', value: DEPTCODE, type: sql.Int()},
            {name: 'IPDCODE', value: IPDCODE, type: sql.NVarChar(50)}
        ];
        await QueryDefault(query, params);

        return NextResponse.json( 
            {message: "Progress note added successfully"},
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Failed to save" },
            { status: 500 }
        );
    }
}