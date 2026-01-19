import { NextRequest, NextResponse } from "next/server";

export default function checkApiKey(req: NextRequest): NextResponse | null {
  const expected = process.env.INTERNAL_API_KEY;
  if (!expected) {
    return NextResponse.json(
      { error: "INTERNAL_API_KEY no está configurada" },
      { status: 500 }
    );
  }

  const provided = req.headers.get("x-api-key"); // <- aquí no hay any
  if (!provided || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null; // ok
}
