import { fetchConsultantNotesFromDb } from "@/services/consultant-notes.service";
import { NextRequest } from "next/server";

export async function getConsultantNotesByPatientCode(request: NextRequest) {
  try {
    const body = await request.json();
    const { PATIENTCODE } = body;

    const authHeader = request.headers.get("Authorization");
    const tokenNo = authHeader?.replace("Bearer ", "") || "";

    if (!tokenNo) {
      return {
        success: false,
        message: "Authorization token is required",
        data: [],
      };
    }

    if (!PATIENTCODE) {
      return { success: false, message: "Patient code is required", data: [] };
    }

    // Correctly call the DB service
    const notes = await fetchConsultantNotesFromDb({
      tokenNo,
      data: { PATIENTCODE },
    });

    return notes; // already has {success, message, data}
  } catch (error) {
    return {
      success: false,
      message: "Internal Server Error",
      data: [],
    };
  }
}
