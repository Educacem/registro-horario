import { updateWorkerTime } from "@/lib/workTime/workTime.functions";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { date, clockIn, clockOut } = body;
    const id = parseInt(params.id, 10);
    if (!date && !clockIn && !clockOut) {
      return NextResponse.json(
        {
          message:
            "At least one field (date, clockIn, clockOut) must be provided",
        },
        { status: 400 }
      );
    }
    const updatedWorkerTime = await updateWorkerTime(id, {
      date: date ? new Date(date) : undefined,
      clockIn: clockIn ? new Date(clockIn) : undefined,
      clockOut: clockOut ? new Date(clockOut) : undefined,
    });
    return NextResponse.json(updatedWorkerTime, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error updating work time";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const { deleteWorkerTime } = await import(
      "@/lib/workTime/workTime.functions"
    );
    await deleteWorkerTime(id);
    return NextResponse.json(
      { message: "Work time deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error deleting work time";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
