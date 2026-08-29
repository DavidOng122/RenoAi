import { NextResponse } from "next/server";
import { ProblemBriefSchema } from "@/schemas/problem-brief.schema";
import { analyseProject } from "@/server/pipeline/analyse-project";
import { auth } from "@/auth";

export const POST = auth(async function POST(request) {
  if (!request.auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  try {
    const body = await request.json();
    const problem = ProblemBriefSchema.parse(body.problem);
    return NextResponse.json(await analyseProject(problem, body.evidence || { photos: [], videos: [] }));
  } catch (error) { console.error(error); return NextResponse.json({ error: "Unable to analyse project" }, { status: 500 }); }
});
