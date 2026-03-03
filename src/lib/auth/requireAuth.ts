import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export function requireAuth(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  try {
    const payload = jwt.verify(token, process.env.AUTH_SECRET!);
    return { ok: true, payload };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
}
