import { NextResponse } from "next/server";
import { createProblemAnalysis } from "@/server/ai/qwen";
import { auth } from "@/auth";

export const POST = auth(async function POST(request) {
  if (!request.auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  try { return NextResponse.json(await createProblemAnalysis(await request.json())); }
  catch (error) { console.error(error); return NextResponse.json({ error: "Unable to create problem brief" }, { status: 500 }); }
});
