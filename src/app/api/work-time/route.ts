import { findWorkerByDni } from "@/lib/workers/workers.function";
import {
  createWorkerTime,
  getAllWorkersTime,
} from "@/lib/workTime/workTime.functions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const workersTime = await getAllWorkersTime();
    return NextResponse.json(workersTime, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error fetching work times";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { workerId, clockIn, clockOut, dni } = body;
    const getDni = await findWorkerByDni(dni);
    if (!getDni)
      return NextResponse.json(
        { message: "DNI no encontrado" },
        { status: 404 }
      );
    if (!workerId || !clockIn || !clockOut) {
      return NextResponse.json(
        { message: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }
    const newWorkerTime = await createWorkerTime({
      workerId,
      clockIn,
      clockOut,
    });
    return NextResponse.json(newWorkerTime, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error creating work time";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
