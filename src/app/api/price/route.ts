import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ProblemBriefSchema } from "@/schemas/problem-brief.schema";
import { estimatePrice } from "@/server/pricing/engine";

export const POST = auth(async function POST(request) {
  if (!request.auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  try {
    const body = await request.json();
    const problem = ProblemBriefSchema.parse(body.problem);
    return NextResponse.json(await estimatePrice(problem));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to estimate price" }, { status: 500 });
  }
});
