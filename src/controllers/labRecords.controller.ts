import { fetchLabRecordsFromDb } from "@/services/labRecords.service";
import { NextRequest } from "next/server";

export async function getlabDataForConsultant(request:NextRequest) {
    try{
        const body = await request.json();
        const { Patientcode } = body;

        const authHeader = request.headers.get("Authorization");
        const tokenNo = authHeader?.replace("Bearer ", "") || "";

        if (!tokenNo) {
            return {
                success: false,
                message: "Authorization token is required",
                data: [],
            };
        }

        if (!Patientcode) {
            return { success: false, message: "Patient code is required", data: [] };
        }

        // Correctly call the DB service
        const labRecords = await fetchLabRecordsFromDb({
            tokenNo,
            data: { Patientcode },
        });

        return labRecords; // already has {success, message, data}
    } catch (error) {
        return {
            success: false,
            message: "Error fetching lab records",
            data: [],
        };
    }
}