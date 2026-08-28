import { NextResponse } from "next/server";
import { createProblemAnalysis } from "@/server/ai/qwen";

export async function POST(request: Request) {
  try { return NextResponse.json(await createProblemAnalysis(await request.json())); }
  catch (error) { console.error(error); return NextResponse.json({ error: "Unable to update problem brief" }, { status: 500 }); }
}
