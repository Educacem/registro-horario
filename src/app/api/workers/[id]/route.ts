import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getWorkerById,
  softDeleteWorker,
  updateWorker,
} from "@/lib/workers/workers.services";
import checkApiKey from "@/helper/functions/functions";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PUT /api/workers/:id
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const auth = checkApiKey(req);
    if (auth) return auth;
    const { id } = await context.params;
    const workerId = Number(id);

    if (!workerId) {
      return NextResponse.json(
        { error: "Worker id is required" },
        { status: 400 },
      );
    }
    if (Number.isNaN(workerId)) {
      return NextResponse.json({ error: "Invalid worker id" }, { status: 400 });
    }

    const body = await req.json();
    const { dni, name, lastName, companyId } = body;
    if (!dni && !name && !lastName && !companyId) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const existingWorker = await getWorkerById(workerId);
    if (!existingWorker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    const updated = await updateWorker(workerId, body);
    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "DNI already exists" },
        { status: 409 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Error updating worker";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/workers/:id
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const auth = checkApiKey(req);
    if (auth) return auth;
    const { id } = await context.params;
    const workerId = Number(id);
    if (!workerId) {
      return NextResponse.json(
        { error: "Worker id is required" },
        { status: 400 },
      );
    }

    if (Number.isNaN(workerId)) {
      return NextResponse.json({ error: "Invalid worker id" }, { status: 400 });
    }

    const existingWorker = await getWorkerById(workerId);
    if (!existingWorker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    const deleted = await softDeleteWorker(workerId);
    return NextResponse.json(deleted, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error deleting worker";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
