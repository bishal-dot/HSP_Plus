import { QueryDefault } from "@/lib/db";

export async function getPrescriptionMaster() {
    const routes = await QueryDefault(
        `SELECT UnkId AS Code, Name AS label FROM Medi_Route_Master WHERE routeActive = 1;`
    )

    const frequency = await QueryDefault(
        `SELECT UnkId AS Code, Name AS label FROM Medi_Frequency_Master;`
    )

    const instructions = await QueryDefault(
        `SELECT UnkId AS Code, Name AS label FROM Medi_Instruction_Master WHERE Active = 1;`
    )

    return {
        routes,
        frequency,
        instructions
    }   
}

export async function getFacultyMaster() {
    const faculties = await QueryDefault(
        `SELECT FacultyCode AS Code, FacultyName AS label
         FROM hsp_FacultyMaster;`
    );
    console.log("Db Result", faculties);
    return faculties || [];
}

