// src/app/api/work-time/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import checkApiKey from "@/helper/functions";
import {
  updateWorkerTime,
  deleteWorkerTime,
} from "@/lib/workTime/workTime.functions";
type ParamsPromise = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: ParamsPromise) {
  const auth = checkApiKey(req);
  if (auth) return auth;

  try {
    const { id } = await params;
    const workerTimeId = Number(id);

    if (!Number.isInteger(workerTimeId) || workerTimeId <= 0) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    const body = (await req.json()) as Partial<{
      date: string;
      clockIn: string;
      clockOut: string;
    }>;

    const { date, clockIn, clockOut } = body;

    if (!date && !clockIn && !clockOut) {
      return NextResponse.json(
        {
          message:
            "At least one field (date, clockIn, clockOut) must be provided",
        },
        { status: 400 },
      );
    }

    const updatedWorkerTime = await updateWorkerTime(workerTimeId, {
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

export async function DELETE(req: NextRequest, { params }: ParamsPromise) {
  const auth = checkApiKey(req);
  if (auth) return auth;

  try {
    const parsedId = Number((await params).id);
    if (Number.isNaN(parsedId)) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    await deleteWorkerTime(parsedId);

    return NextResponse.json(
      { message: "Work time deleted successfully" },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error deleting work time";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
