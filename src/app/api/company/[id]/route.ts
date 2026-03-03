/* import { requireAuth } from "@/lib/auth/requireAuth";
import {
  updateCompany,
  deleteCompany,
  getCompanyById,
} from "@/lib/company/company.services";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PUT /api/company/:id
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const auth = requireAuth(req);
    if (!auth.ok) return auth.response;
    const { id } = await context.params;
    const companyId = Number(id);
    if (!companyId) {
      return NextResponse.json(
        { error: "Company id is required" },
        { status: 400 },
      );
    }
    if (Number.isNaN(companyId)) {
      return NextResponse.json(
        { error: "Invalid company id" },
        { status: 400 },
      );
    }
    const body = await req.json();
    const { name } = body;
    if (!name) {
      return NextResponse.json(
        { message: "Nothing to update" },
        { status: 400 },
      );
    }
    const existingCompany = await getCompanyById(companyId);
    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    const updated = await updateCompany(companyId, body);
    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error updating company";
    return NextResponse.json({ error: message }, { status: 500 });
  }
} */
/* 
// DELETE /api/company/:id
export async function DELETE(req: NextRequest, context: RouteContext) {
  {
    try {
      const auth = requireAuth(req);
      if (!auth.ok) return auth.response;
      const { id } = await context.params;
      const companyId = Number(id);

      if (!companyId) {
        return NextResponse.json(
          { error: "Company id is required" },
          { status: 400 },
        );
      }
      if (Number.isNaN(companyId)) {
        return NextResponse.json(
          { error: "Invalid company id" },
          { status: 400 },
        );
      }
      const existingCompany = await getCompanyById(companyId);
      if (!existingCompany) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 },
        );
      }
      const deleted = await deleteCompany(companyId);
      return NextResponse.json(deleted, { status: 200 });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error deleting company";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }
}
 */
