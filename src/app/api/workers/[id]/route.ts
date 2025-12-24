import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getWorkerById, softDeleteWorker, updateWorker } from "@/lib/workers/workers.function";

// PUT /api/workers/:id
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const workerId = Number(params.id);
    if (isNaN(workerId)) {
      return NextResponse.json({ error: "Invalid worker id" }, { status: 400 });
    }

    const body = await req.json();
    const { dni, name, lastName } = body;

    if (!dni && !name && !lastName) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const existingWorker = await getWorkerById(workerId);

    if (!existingWorker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    const updated = await updateWorker(workerId, body);
    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "DNI already exists" },
        { status: 409 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Error updating worker";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/workers/:id
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const workerId = Number(params.id);
    if (isNaN(workerId)) {
      return NextResponse.json({ error: "Invalid worker id" }, { status: 400 });
    }

    const existingWorker = await getWorkerById(workerId);

    if (!existingWorker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    const deleted = await softDeleteWorker(workerId);

    return NextResponse.json(deleted);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error deleting worker";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
