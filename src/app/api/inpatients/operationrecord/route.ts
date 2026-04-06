import { DbParameter, getDefaultPool, QueryDefault } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

// ── helpers ──────────────────────────────────────────────────────────────────

/** "HH:MM" | "HH:MM:SS" | "" | undefined → Date (today's date, given time) | null
 *  sql.Time() requires a Date object, NOT a bare time string.            */
function parseTimeToDate(timeStr?: string | null): Date | null {
  if (!timeStr || !timeStr.trim()) return null;
  const parts = timeStr.trim().split(":").map(Number);
  if (parts.length < 2 || parts.some(isNaN)) return null;
  const [h, m, s = 0] = parts;
  if (h < 0 || h > 23 || m < 0 || m > 59 || s < 0 || s > 59) return null;
  const d = new Date();
  d.setHours(h, m, s, 0);
  return d;
}

/** "YYYY-MM-DD" | Date | "" | undefined → Date | null
 *  sql.SmallDateTime() also needs a real Date.                           */
function parseDate(val?: string | null): Date | null {
  if (!val || !String(val).trim()) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

/** Coerce empty strings to null so optional NVarChar fields don't store "". */
function strOrNull(val?: string | null): string | null {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  return s === "" ? null : s;
}

// ── handler ──────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      MrNO, IPDCode, Otdate, Starttime, EndTime,
      PreOPDiagnosis, PostOpDiagnosis, Diagnosis,
      Surgery, SurgeryGroup, OTProcedure, Closure,
      CultureSensitivity, BIOPSY, IMPLANT,
      DEPARTMENT, REMARKS, c_user, SubDepartment,
      ServiceCodeid, Op_Preposed, Op_Executed,
      anesthesiaGroup, SkinIncisionTime, SkinClosureTime,
      BloodLoss, Counts, IIUsage, Histopathology, RegType,
      consultantcode, consultantname, memberRole
    } = body;

    // ── validate required fields early ───────────────────────────────────────
    if (!MrNO || !IPDCode) {
      return NextResponse.json(
        { success: false, message: "MrNO and IPDCode are required" },
        { status: 400 },
      );
    }

    const pool = await getDefaultPool();

    const masRes = await pool
      .request()
      .query(
        `SELECT ISNULL(MAX(UnkCode), 0) + 1 AS UnkCode FROM GPHmd_LIVE.dbo.IPD_OperationRecordMaster;`,
      );
    const UnkCode = masRes.recordset[0].UnkCode;

    const maxRes = await pool
      .request()
      .query(
        `SELECT ISNULL(MAX(OperationId), 0) + 1 AS OperationId FROM GPHmd_LIVE.dbo.IPD_OperationRecordMaster;`,
      );
    const OperationId = maxRes.recordset[0].OperationId;

    const now = new Date();

    const operationParams: DbParameter[] = [
      { name: "UnkCode",    type: sql.BigInt(), value: UnkCode },
      { name: "OperationId", type: sql.BigInt(), value: OperationId },
      { name: "Centercode", type: sql.Int(),    value: 1 },

      { name: "MrNO",    type: sql.VarChar(50), value: String(MrNO) },
      { name: "IPDCode", type: sql.VarChar(50), value: String(IPDCode) },

      // ── FIX: use parseDate / parseTimeToDate so mssql gets real Date objects
      { name: "Otdate",    type: sql.SmallDateTime(), value: parseDate(Otdate) },
      { name: "Starttime", type: sql.Time(),           value: parseTimeToDate(Starttime) },
      { name: "EndTime",   type: sql.Time(),           value: parseTimeToDate(EndTime) },

      { name: "PreOPDiagnosis",  type: sql.NVarChar(sql.MAX), value: strOrNull(PreOPDiagnosis) },
      { name: "PostOpDiagnosis", type: sql.NVarChar(sql.MAX), value: strOrNull(PostOpDiagnosis) },
      { name: "Diagnosis",       type: sql.NVarChar(sql.MAX), value: strOrNull(Diagnosis) },

      { name: "Surgery",       type: sql.VarChar(sql.MAX), value: strOrNull(Surgery) },
      { name: "SurgeryGroup",  type: sql.VarChar(50),      value: strOrNull(SurgeryGroup) },

      { name: "OTProcedure",       type: sql.NVarChar(sql.MAX), value: strOrNull(OTProcedure) },
      { name: "Closure",           type: sql.NVarChar(sql.MAX), value: strOrNull(Closure) },
      { name: "CultureSensitivity",type: sql.NVarChar(sql.MAX), value: strOrNull(CultureSensitivity) },
      { name: "BIOPSY",            type: sql.NVarChar(1050),    value: strOrNull(BIOPSY) },
      { name: "IMPLANT",           type: sql.NVarChar(1050),    value: strOrNull(IMPLANT) },

      { name: "DEPARTMENT",    type: sql.Int(), value: DEPARTMENT    ?? null },
      { name: "SubDepartment", type: sql.Int(), value: SubDepartment ?? null },

      { name: "REMARKS", type: sql.NVarChar(sql.MAX), value: strOrNull(REMARKS) },

      { name: "C_DATE", type: sql.SmallDateTime(), value: now },
      { name: "m_DATE", type: sql.SmallDateTime(), value: now },
      { name: "DE_ACTIVE", type: sql.Bit(), value: 0 },

      { name: "c_user", type: sql.Int(), value: c_user ?? 1 },
      { name: "m_user", type: sql.Int(), value: c_user ?? 1 },

      { name: "ServiceCodeid", type: sql.VarChar(50), value: strOrNull(ServiceCodeid) },

      { name: "Op_Preposed", type: sql.NVarChar(sql.MAX), value: strOrNull(Op_Preposed) },
      { name: "Op_Executed", type: sql.NVarChar(sql.MAX), value: strOrNull(Op_Executed) },

      { name: "anesthesiaGroup",  type: sql.NVarChar(sql.MAX), value: strOrNull(anesthesiaGroup) },
      { name: "SkinIncisionTime", type: sql.NVarChar(250),     value: strOrNull(SkinIncisionTime) },
      { name: "SkinClosureTime",  type: sql.NVarChar(250),     value: strOrNull(SkinClosureTime) },
      { name: "BloodLoss",        type: sql.NVarChar(250),     value: strOrNull(BloodLoss) },
      { name: "Counts",           type: sql.NVarChar(250),     value: strOrNull(Counts) },
      { name: "IIUsage",          type: sql.NVarChar(250),     value: strOrNull(IIUsage) },
      { name: "Histopathology",   type: sql.VarChar(sql.MAX),  value: strOrNull(Histopathology) },

      { name: "RegType", type: sql.Int(), value: RegType ?? 1 },
    ];

    const operationQuery = `
      INSERT INTO GPHmd_Live.dbo.IPD_OperationRecordMaster (
        UnkCode, OperationId, Centercode, MrNO, IPDCode,
        Otdate, Starttime, EndTime,
        PreOPDiagnosis, PostOpDiagnosis, Diagnosis,
        Surgery, SurgeryGroup, OTProcedure, Closure,
        CultureSensitivity, BIOPSY, IMPLANT,
        DEPARTMENT, SubDepartment, REMARKS,
        C_DATE, m_DATE, DE_ACTIVE,
        c_user, m_user, ServiceCodeid,
        Op_Preposed, Op_Executed, anesthesiaGroup,
        SkinIncisionTime, SkinClosureTime,
        BloodLoss, Counts, IIUsage,
        Histopathology, RegType
      ) VALUES (
        @UnkCode, @OperationId, @Centercode, @MrNO, @IPDCode,
        @Otdate, @Starttime, @EndTime,
        @PreOPDiagnosis, @PostOpDiagnosis, @Diagnosis,
        @Surgery, @SurgeryGroup, @OTProcedure, @Closure,
        @CultureSensitivity, @BIOPSY, @IMPLANT,
        @DEPARTMENT, @SubDepartment, @REMARKS,
        @C_DATE, @m_DATE, @DE_ACTIVE,
        @c_user, @m_user, @ServiceCodeid,
        @Op_Preposed, @Op_Executed, @anesthesiaGroup,
        @SkinIncisionTime, @SkinClosureTime,
        @BloodLoss, @Counts, @IIUsage,
        @Histopathology, @RegType
      )`;

    await QueryDefault(operationQuery, operationParams);

   
    const memberParams: DbParameter[] = [
      { name: "OperationId", type: sql.BigInt(),     value: Number(OperationId) },
      { name: "Centercode",  type: sql.Int(),        value: 1 },
      { name: "IPDCode",     type: sql.VarChar(50),  value: String(IPDCode) },
      { name: "MrNO",        type: sql.VarChar(50),  value: String(MrNO) },
      { name: "MemberType",  type: sql.Int(),        value: memberRole ?? null},
      { name: "Member",      type: sql.VarChar(550), value: consultantname ?? null },
      { name: "c_date",      type: sql.SmallDateTime(), value: now },
    ];

    const memberQuery = `
      INSERT INTO GPHmd_Live.dbo.IPD_OPERATIONRECORDMemberList (
        OperationId, Centercode, IPDCode, MrNO, MemberType, Member, c_date
      ) VALUES (
        @OperationId, @Centercode, @IPDCode, @MrNO, @MemberType, @Member, @c_date
      )
    `;

    await QueryDefault(memberQuery, memberParams);

    

    return NextResponse.json(
      { success: true, message: "Operation Record added successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[POST /operation-record]", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}