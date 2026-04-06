import { DbParameter, getDefaultPool, QueryDefault } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

export async function POST(request:NextRequest) {
    try{
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
        const body = await request.json();

        const {
            MrNO, IPDCode, DischargeType, Diagnosis,
            PreOPDiagnosis, CO, HOPI, PastHistory, PersonalHistory,
            OE, GC, PICCLED, SE, CHEST, CBS, CNS, PA, OEFreeBox,
            OTFinding,
            COHStay, TDHSFreeBox, TDHSOTNote, TDHSPTNote, TDHSTNote,
            AOE, AGC, APICCLED, ASE, ACHEST, ACBS, ACNS, APA,
            AODOTNote, AODPTNote, AODSTNote, AODNursingNote,
            RX, ADVICE, userId, C_DATE, 
        } = body;

        // 3. Validate required fields
        if (!MrNO ||  !DischargeType || !Diagnosis) {
            return NextResponse.json(
            { message: "MrNO,  DischargeType and Diagnosis are required" },
            { status: 400 }
            );
        }
        const pool = await getDefaultPool();
        const masRes = await pool.request()
            .query(`SELECT ISNULL(MAX(UnkCode), 0) + 1 as UnkCode FROM GPHmd_LIVE.dbo.IPD_DischargeRecordMaster;`);
        const UnkCode = masRes.recordset[0].UnkCode;

        const maxRes = await pool.request()
            .query(`SELECT ISNULL(MAX(DischargeID), 0) + 1 as DischargeID FROM GPHmd_LIVE.dbo.IPD_DischargeRecordMaster;`);
        const DischargeID = maxRes.recordset[0].DischargeID;

        // 5. Define all params using your DbParameter pattern
        const dischargeParams: DbParameter[] = [
        { name: "UnkCode",         type: sql.BigInt(),           value: UnkCode          },
        { name: "DischargeID",     type: sql.BigInt(),           value: DischargeID     },
        { name: "Centercode",      type: sql.Int(),              value: 1               },
        { name: "MrNO",            type: sql.NVarChar(50),     value: MrNO            },
        { name: "IPDCode",         type: sql.VarChar(50),      value: String(IPDCode)     },
        { name: "DischargeType",   type: sql.VarChar(100),     value: DischargeType   },
        { name: "Diagnosis",       type: sql.NVarChar(sql.MAX),value: Diagnosis        },
        { name: "PreOPDiagnosis",  type: sql.NVarChar(sql.MAX),value: PreOPDiagnosis  ?? null },
        { name: "CO",              type: sql.NVarChar(sql.MAX),value: CO              ?? null },
        { name: "HOPI",            type: sql.NVarChar(sql.MAX),value: HOPI            ?? null },
        { name: "PastHistory",     type: sql.NVarChar(sql.MAX),value: PastHistory     ?? null },
        { name: "PersonalHistory", type: sql.NVarChar(sql.MAX),value: PersonalHistory ?? null },
        { name: "OE",              type: sql.NVarChar(sql.MAX),value: OE              ?? null },
        { name: "GC",              type: sql.NVarChar(sql.MAX),value: GC              ?? null },
        { name: "PICCLED",         type: sql.NVarChar(sql.MAX),value: PICCLED         ?? null },
        { name: "SE",              type: sql.NVarChar(sql.MAX),value: SE              ?? null },
        { name: "CHEST",           type: sql.NVarChar(sql.MAX),value: CHEST           ?? null },
        { name: "CBS",             type: sql.NVarChar(sql.MAX),value: CBS             ?? null },
        { name: "CNS",             type: sql.NVarChar(sql.MAX),value: CNS             ?? null },
        { name: "PA",              type: sql.NVarChar(sql.MAX),value: PA              ?? null },
        { name: "OEFreeBox",       type: sql.NVarChar(sql.MAX),value: OEFreeBox       ?? null },
        { name: "OTFinding",       type: sql.NVarChar(sql.MAX),value: OTFinding       ?? null },
        { name: "COHStay",         type: sql.NVarChar(sql.MAX),value: COHStay         ?? null },
        { name: "TDHSFreeBox",     type: sql.NVarChar(sql.MAX),value: TDHSFreeBox     ?? null },
        { name: "TDHSOTNote",      type: sql.NVarChar(sql.MAX),value: TDHSOTNote      ?? null },
        { name: "TDHSPTNote",      type: sql.NVarChar(sql.MAX),value: TDHSPTNote      ?? null },
        { name: "TDHSTNote",       type: sql.NVarChar(sql.MAX),value: TDHSTNote       ?? null },
        { name: "AOE",             type: sql.NVarChar(sql.MAX),value: AOE             ?? null },
        { name: "AGC",             type: sql.NVarChar(sql.MAX),value: AGC             ?? null },
        { name: "APICCLED",        type: sql.NVarChar(sql.MAX),value: APICCLED        ?? null },
        { name: "ASE",             type: sql.NVarChar(sql.MAX),value: ASE             ?? null },
        { name: "ACHEST",          type: sql.NVarChar(sql.MAX),value: ACHEST          ?? null },
        { name: "ACBS",            type: sql.NVarChar(sql.MAX),value: ACBS            ?? null },
        { name: "ACNS",            type: sql.NVarChar(sql.MAX),value: ACNS            ?? null },
        { name: "APA",             type: sql.NVarChar(sql.MAX),value: APA             ?? null },
        { name: "AODOTNote",       type: sql.NVarChar(sql.MAX),value: AODOTNote       ?? null },
        { name: "AODPTNote",       type: sql.NVarChar(sql.MAX),value: AODPTNote       ?? null },
        { name: "AODSTNote",       type: sql.NVarChar(sql.MAX),value: AODSTNote       ?? null },
        { name: "AODNursingNote",  type: sql.NVarChar(sql.MAX),value: AODNursingNote  ?? null },
        { name: "RX",              type: sql.NVarChar(sql.MAX),value: RX              ?? null },
        { name: "ADVICE",          type: sql.NVarChar(sql.MAX),value: ADVICE          ?? null },
        { name: "C_DATE",          type: sql.DateTime(),        value: new Date()     },
        { name: "c_user",          type: sql.Int(),       value: Number(userId) }, 
    ];


        const dischargeQuery = ` INSERT INTO GPHmd_Live.dbo.IPD_DischargeRecordMaster (
          UnkCode, DischargeID, Centercode, MrNO, IPDCode, DischargeType, Diagnosis,
          PreOPDiagnosis, CO, HOPI, PastHistory, PersonalHistory,
          OE, GC, PICCLED, SE, CHEST, CBS, CNS, PA, OEFreeBox,
          OTFinding,
          COHStay, TDHSFreeBox, TDHSOTNote, TDHSPTNote, TDHSTNote,
          AOE, AGC, APICCLED, ASE, ACHEST, ACBS, ACNS, APA,
          AODOTNote, AODPTNote, AODSTNote, AODNursingNote,
          RX, ADVICE, C_DATE, c_user
        )
        OUTPUT INSERTED.UnkCode
        VALUES (
          @UnkCode, @DischargeID, @Centercode, @MrNO, @IPDCode, @DischargeType, @Diagnosis,
          @PreOPDiagnosis, @CO, @HOPI, @PastHistory, @PersonalHistory,
          @OE, @GC, @PICCLED, @SE, @CHEST, @CBS, @CNS, @PA, @OEFreeBox,
          @OTFinding,
          @COHStay, @TDHSFreeBox, @TDHSOTNote, @TDHSPTNote, @TDHSTNote,
          @AOE, @AGC, @APICCLED, @ASE, @ACHEST, @ACBS, @ACNS, @APA,
          @AODOTNote, @AODPTNote, @AODSTNote, @AODNursingNote,
          @RX, @ADVICE , @C_DATE, @c_user
    )`;

    await QueryDefault(dischargeQuery, dischargeParams);

    return NextResponse.json({ success: true, message: "Discharge Summary added successfully" }, { status: 200 });
    } catch (error) {
        console.log('error', error);
        return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
    }
}