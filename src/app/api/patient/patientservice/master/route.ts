// app/api/services/bytype/route.ts
import { getServicesByType } from '@/services/ptservices/serviceMasterService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceTypeId = searchParams.get('serviceTypeId');

    if (!serviceTypeId) {
      return NextResponse.json(
        { success: false, error: "serviceTypeId is required" },
        { status: 400 }
      );
    }

    const serviceTypeIdNum = parseInt(serviceTypeId);

    if (isNaN(serviceTypeIdNum)) {
      return NextResponse.json(
        { success: false, error: "serviceTypeId must be a valid number" },
        { status: 400 }
      );
    }

    const services = await getServicesByType(serviceTypeIdNum);

    return NextResponse.json({
      success: true,
      data: services
    });

  } catch (error) {
    console.error("Error in /api/services/bytype:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch services by type",
      details: (error as Error).message
    }, { status: 500 });
  }
}