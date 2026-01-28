import { NextResponse, NextRequest } from "next/server";
import checkApiKey from "@/helper/functions/functions";
import { createCompany, getAllCompanys } from "@/lib/company/company.services";

// GET /api/company
export async function GET(req: NextRequest) {
  try {
    const auth = checkApiKey(req);
    if (auth) return auth;
    const companys = await getAllCompanys();
    return NextResponse.json(companys, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error fetching company";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

//Post /api/company
export async function POST(req: NextRequest) {
  try {
    const auth = checkApiKey(req);
    if (auth) return auth;
    const body = await req.json();
    const { name } = body;
    if (!name) {
      return NextResponse.json(
        { message: "Faltan datos obligatorios" },
        { status: 400 },
      );
    }
    const newCompany = await createCompany({ name });
    return NextResponse.json(newCompany, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error creating company";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
