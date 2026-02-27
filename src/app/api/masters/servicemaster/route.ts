import { QueryDefault } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const services = await QueryDefault(`
      SELECT 
        ServiceCode, ServiceName, Alias, DeptCode, Remarks, Cost, ServiceType,
        AcCode, isRateChangeable, Taxable, DefaultDisburseConsultant,
        InActive, CenterId, IsDonorBase, IsNotWorkList, c_date, M_date,
        c_user, M_user
      FROM hsp_ServiceMaster
      WHERE InActive = 0
    `);

    // Define service type mappings
    const serviceTypeMap: { [key: number]: string } = {
      0: "General",
      1: "Room",
      2: "Operation"
    };

    // Get unique service types from the data
    const uniqueServiceTypes = [...new Set(services.map((s: any) => s.ServiceType))]
      .filter((type): type is number => type !== null && type !== undefined)
      .sort((a, b) => a - b);

    const serviceTypes = uniqueServiceTypes.map(type => ({
      label: serviceTypeMap[type] || `Type ${type}`,
      value: type
    }));

    return NextResponse.json({ 
      services,
      serviceTypes
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Failed to load masters" }, 
      { status: 500 }
    );
  }
}