import { AnalysisProgress } from "@/features/processing/AnalysisProgress";

export default async function ProcessingPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string | string[] }>;
}) {
  const { stage } = await searchParams;
  return <AnalysisProgress stage={stage === "project" ? "project" : "problem"} />;
}
