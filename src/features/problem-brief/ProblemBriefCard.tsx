import type { ProblemBrief } from "@/schemas/problem-brief.schema";

export function ProblemBriefCard({ brief }: { brief: ProblemBrief }) {
  const details = [
    ["Property", brief.property], ["Location", brief.location], ["Affected item", brief.affected_item],
    ["Observed problem", brief.observed_problem], ["Duration", brief.duration || "Not specified"],
    ["Condition", brief.condition || "Not specified"], ["Customer goal", brief.customer_goal],
  ];
  return <div className="detail-list">{details.map(([label, value]) => <div className="detail" key={label}><small>{label}</small><strong>{value}</strong></div>)}{Object.entries(brief.dynamic_details).filter(([, value]) => value != null).map(([key, value]) => <div className="detail" key={key}><small>{key.replaceAll("_", " ")}</small><strong>{String(value)}</strong></div>)}</div>;
}
