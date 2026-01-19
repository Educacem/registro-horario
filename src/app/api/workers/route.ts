import { NextResponse, NextRequest } from "next/server";
import { createWorker, getAllWorkers } from "@/lib/workers/workers.function";
import checkApiKey from "@/helper/functions";

// GET /api/workers
export async function GET(req: NextRequest) {
  try {
    const auth = checkApiKey(req);
    if (auth) return auth;
    const workers = await getAllWorkers();
    return NextResponse.json(workers, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error fetching workers";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
// POST /api/workers
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dni, name, lastName } = body;

    if (!name || !dni || !lastName) {
      return NextResponse.json(
        { message: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }
    const newWorker = await createWorker({ dni, name, lastName });
    return NextResponse.json(newWorker, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error creating worker";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
