import { NextResponse } from "next/server";
import { ProblemBriefSchema } from "@/schemas/problem-brief.schema";
import { analyseProject } from "@/server/pipeline/analyse-project";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const problem = ProblemBriefSchema.parse(body.problem);
    return NextResponse.json(await analyseProject(problem, body.evidence || { photos: [], videos: [] }));
  } catch (error) { console.error(error); return NextResponse.json({ error: "Unable to analyse project" }, { status: 500 }); }
}
