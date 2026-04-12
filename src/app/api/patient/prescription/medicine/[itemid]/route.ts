import { Con_QueryAsync, DbParameter, GetAsync } from "@/lib/db";
import { masterDbResponseWithToken } from "@/types/masterDb.type";
import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ itemid: string }> }  
) {
  try {
    const resolvedParams = await context.params;
    const itemid = resolvedParams.itemid;  

    const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";

    const tokenParams: DbParameter[] = [
      { name: "TokenNo", type: sql.NVarChar(150), value: token },
    ];
    const dbResponse = await GetAsync<masterDbResponseWithToken>(
      "usp_Pos_S_LogininfoByTokenNo", tokenParams
    );
    if (!dbResponse.length || !dbResponse[0].dbLink) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const { dbLink } = dbResponse[0];

    const query = `
      SELECT
        a.itemid   AS itemid,
        a.Name     AS Name,
        c.Alias    AS Unit
      FROM A_GPH_LIVE_2085_2081_82.dbo.tbproductinfo AS a
      INNER JOIN A_GPH_LIVE_2085_2081_82.dbo.tbunit AS c
        ON a.Unit = c.UnitID
      WHERE a.itemid = @ItemId
    `;

    const queryParams: DbParameter[] = [
      { name: "ItemId", type: sql.Int(), value: Number(itemid) },
    ];

    const result = await Con_QueryAsync<{ itemid: number; Name: string; Unit: string }>(
      dbLink, query, queryParams
    );

    if (!result.length) {
      return NextResponse.json({ success: false, message: "Drug not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}