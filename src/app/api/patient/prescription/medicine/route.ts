import { getMedicineListFromDb } from "@/services/prescription.service";
import { ApiRequest } from "@/types/api.type";
import { MedicineListRequest } from "@/types/prescription.type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    
    if (!token) {
    return NextResponse.json(
        { success: false, message: "Authorization token missing" },
        { status: 401 }
    );
    }

    const { searchParams } = new URL(request.url);

    const apiRequest:  ApiRequest<MedicineListRequest> = {
      tokenNo: token,
      data: {
        ItemName: searchParams.get("ItemName") || "",
        CenterId: Number(searchParams.get("CenterId")),
        DeptCode: Number(searchParams.get("DeptCode")),
        PatientCode: searchParams.get("PatientCode") || "",
        C_User: Number(searchParams.get("C_User"))
      }
    };

    const data = await getMedicineListFromDb(apiRequest);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch medicine list" },
      { status: 500 }
    );
  }
}