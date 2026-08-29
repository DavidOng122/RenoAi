import type { ProblemBrief } from "@/schemas/problem-brief.schema";
import type { MediaItem } from "@/schemas/project-brief.schema";
import type { ReactNode } from "react";

export function ProblemBriefCard({
  brief,
  photos = [],
  expanded = false,
  onToggle,
  footer,
  variant = "default",
}: {
  brief: ProblemBrief;
  photos?: MediaItem[];
  expanded?: boolean;
  onToggle?: () => void;
  footer?: ReactNode;
  variant?: "default" | "analysis";
}) {
  const details = [
    ["Property", brief.property], ["Location", brief.location], ["Affected item", brief.affected_item],
    ["Observed problem", brief.observed_problem], ["Duration", brief.duration || "Not specified"],
    ["Condition", brief.condition || "Not specified"], ["Customer goal", brief.customer_goal],
  ];
  const extraDetails = Object.entries(brief.dynamic_details).filter(([, value]) => value != null);

  if (variant === "default") {
    return <div className="detail-list">{details.map(([label, value]) => <div className="detail" key={label}><small>{label}</small><strong>{value}</strong></div>)}{extraDetails.map(([key, value]) => <div className="detail" key={key}><small>{key.replaceAll("_", " ")}</small><strong>{String(value)}</strong></div>)}</div>;
  }

  return (
    <section className="analysis-brief-card">
      <div className="analysis-photo-row" aria-label="Repair photos">
        {Array.from({ length: 3 }, (_, index) => {
          const photo = photos[index];
          return photo
            ? <img src={photo.thumbnail_url || photo.storage_url} alt={`Repair evidence ${index + 1}`} key={photo.id} />
            : <span aria-hidden key={index} />;
        })}
      </div>
      <div className="analysis-detail-table">
        {details.map(([label, value]) => (
          <div className="analysis-detail-row" key={label}>
            <small>{label}</small>
            <p>{value}</p>
          </div>
        ))}
        {expanded && extraDetails.map(([key, value]) => (
          <div className="analysis-detail-row analysis-extra-row" key={key}>
            <small>{key.replaceAll("_", " ")}</small>
            <p>{String(value)}</p>
          </div>
        ))}
      </div>
      <button className="analysis-more-toggle" type="button" aria-expanded={expanded} onClick={onToggle}>
        More details...
        <img className={expanded ? "open" : ""} src="/analysis/issue-chevron.svg" alt="" width={8} height={5} />
      </button>
      {footer}
    </section>
  );
}
