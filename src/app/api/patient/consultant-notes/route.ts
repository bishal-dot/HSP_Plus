'use server';

import { NextRequest, NextResponse } from 'next/server';
import { DbParameter, ExecuteAsync, QueryDefault } from '@/lib/db';
import sql from 'mssql';

// Simple function to generate a unique bigint ID
function generateUnkID(): bigint {
  // Use current timestamp + random number to avoid collisions
  return BigInt(Date.now() * 1000 + Math.floor(Math.random() * 1000));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      patientCode,
      regCode,
      consultantCode,
      deptCode,
      userId,
      formData,
    } = body;

    // Prepare parameters with correct SQL types
    const params: DbParameter[] = [
      { name: 'UnkID', type: sql.BigInt(), value: generateUnkID() },
      { name: 'PatientCode', type: sql.NVarChar(50), value: patientCode },
      { name: 'RegCode', type: sql.Int(), value: Number(regCode) },
      { name: 'ConsultantCode', type: sql.Int(), value: Number(consultantCode) },
      { name: 'DeptCode', type: sql.Int(), value: Number(deptCode) },

      { name: 'PresentComplaints', type: sql.NVarChar(sql.MAX), value: formData.chiefComplaint || null },
      { name: 'HOPI', type: sql.NVarChar(sql.MAX), value: formData.hopi || null },
      { name: 'PreviousHistory', type: sql.NVarChar(sql.MAX), value: formData.pastHistory || null },
      { name: 'MajorIllness', type: sql.NVarChar(sql.MAX), value: formData.medicalHistory || null },
      { name: 'Allergies', type: sql.NVarChar(sql.MAX), value: formData.allergies || null },

      { name: 'GeneralCondition', type: sql.NVarChar(sql.MAX), value: formData.generalCondition || null },
      { name: 'VitalsPR', type: sql.NVarChar(sql.MAX), value: formData.pr || null },
      { name: 'VitalsRR', type: sql.NVarChar(sql.MAX), value: formData.rr || null },
      { name: 'VitalsBP', type: sql.NVarChar(sql.MAX), value: formData.bp || null },
      { name: 'VitalsSpoTwo', type: sql.NVarChar(sql.MAX), value: formData.spo2 || null },
      { name: 'Temprature', type: sql.NVarChar(100), value: formData.temperature || null },
      { name: 'CRT', type: sql.NVarChar(100), value: formData.crt || null },

      { name: 'VitalsRS', type: sql.NVarChar(sql.MAX), value: formData.rs || null },
      { name: 'VitalsCVS', type: sql.NVarChar(sql.MAX), value: formData.cvs || null },
      { name: 'VitalsPerAbdomen', type: sql.NVarChar(sql.MAX), value: formData.pa || null },
      { name: 'VitalsCNS', type: sql.NVarChar(sql.MAX), value: formData.cns || null },
      { name: 'VitalsOthers', type: sql.NVarChar(sql.MAX), value: formData.others || null },

      { name: 'Diagnosis', type: sql.NVarChar(sql.MAX), value: formData.diagnosis || null },
      { name: 'ICDCODE', type: sql.VarChar(50), value: formData.icdCode || null },
      { name: 'Advice', type: sql.NVarChar(100), value: formData.advice || null },

      { name: 'c_user', type: sql.Int(), value: Number(userId) },
    ];

    // Build the INSERT query
    const query = `
      INSERT INTO hsp_DoctorsNotePTWise (
        UnkID, PatientCode, RegCode, ConsultantCode, DeptCode, DateE,
        PresentComplaints, HOPI, PreviousHistory, MajorIllness, Allergies,
        GeneralCondition, VitalsPR, VitalsRR, VitalsBP, VitalsSpoTwo, Temprature, CRT,
        VitalsRS, VitalsCVS, VitalsPerAbdomen, VitalsCNS, VitalsOthers,
        Diagnosis, ICDCODE, Advice, c_user, C_DTime
      )
      VALUES (
        @UnkID, @PatientCode, @RegCode, @ConsultantCode, @DeptCode, GETDATE(),
        @PresentComplaints, @HOPI, @PreviousHistory, @MajorIllness, @Allergies,
        @GeneralCondition, @VitalsPR, @VitalsRR, @VitalsBP, @VitalsSpoTwo, @Temprature, @CRT,
        @VitalsRS, @VitalsCVS, @VitalsPerAbdomen, @VitalsCNS, @VitalsOthers,
        @Diagnosis, @ICDCODE, @Advice, @c_user, GETDATE()
      )
    `;

    await QueryDefault(query, params);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Insert Error:', error);
    return NextResponse.json({ success: false, message: error }, { status: 500 });
  }
}
