import checkApiKey from "@/helper/functions/functions";
import { findWorkerByDni } from "@/lib/workers/workers.services";
import {
  createWorkerTime,
  findDuplicateWorkEndTimeExact,
  findDuplicateWorkStartTimeExact,
  getAllWorkersTime,
} from "@/lib/workTime/workTime.services";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const auth = checkApiKey(req);
    if (auth) return auth;
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
    const { date, clockIn, clockOut, dni } = body;
    const baseDate = new Date(date);

    if (isNaN(baseDate.getTime())) {
      return NextResponse.json({ message: "Fecha inválida" }, { status: 400 });
    }
    if (!date || !dni || !clockIn || !clockOut) {
      return NextResponse.json(
        { message: "Faltan datos obligatorios" },
        { status: 400 },
      );
    }

    const worker = await findWorkerByDni(dni);
    if (!worker)
      return NextResponse.json(
        { message: "DNI no encontrado" },
        { status: 404 },
      );
    const [inHour, inMinute] = clockIn.split(":").map(Number);

    const [outHour, outMinute] = clockOut.split(":").map(Number);

    const clockInDate = new Date(baseDate);
    clockInDate.setHours(inHour, inMinute, 0, 0);

    const clockOutDate = new Date(baseDate);
    clockOutDate.setHours(outHour, outMinute, 0, 0);

    const duplicateStartTime = await findDuplicateWorkStartTimeExact(
      worker.id,
      clockInDate,
    );

    if (duplicateStartTime) {
      return NextResponse.json(
        { message: "Ya existe una jornada registrada con esa hora de entrada" },
        { status: 409 },
      );
    }
    const duplicateEndTime = await findDuplicateWorkEndTimeExact(
      worker.id,
      clockOutDate,
    );
    if (duplicateEndTime) {
      return NextResponse.json(
        { message: "Ya existe una jornada registrada con esa hora de salida" },
        { status: 409 },
      );
    }

    const newWorkerTime = await createWorkerTime({
      workerId: worker.id,
      date: baseDate,
      clockIn: clockInDate,
      clockOut: clockOutDate,
    });
    return NextResponse.json(newWorkerTime, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error creating work time";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
