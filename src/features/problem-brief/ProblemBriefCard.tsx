"use client";

import { useState } from "react";
import type { ProblemBrief } from "@/schemas/problem-brief.schema";
import type { MediaItem } from "@/schemas/project-brief.schema";

export function ProblemBriefCard({ brief, description, photos }: { brief: ProblemBrief; description?: string; photos?: MediaItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const primary = [
    ["Property", brief.property], ["Location", brief.location], ["Affected item", brief.affected_item],
    ["Observed problem", brief.observed_problem], ["Duration", brief.duration || "Not specified"],
    ["Condition", brief.condition || "Not specified"],
  ];
  const dynamicEntries = Object.entries(brief.dynamic_details).filter(([, value]) => value != null);
  const photoSlots = [0, 1, 2].map((i) => photos?.[i]);

  return (
    <div>
      {description && (
        <div className="brief-message">
          <div className="brief-message-thumb" />
          <p>{description}{photos && photos.length > 1 && <span className="more-badge">+{photos.length - 1}</span>}</p>
        </div>
      )}
      <div className="brief-card">
        <div className="brief-photos">
          {photoSlots.map((photo, i) => photo
            ? <img className="brief-photo" key={photo.id} src={photo.thumbnail_url || photo.storage_url} alt="" />
            : <div className="brief-photo brief-photo-placeholder" key={i} />)}
        </div>
        <div className="brief-rows">
          {primary.map(([label, value]) => (
            <div className="brief-row" key={label}><small>{label}</small><strong>{value}</strong></div>
          ))}
          <div className="brief-row"><small>Customer goal</small><strong>{brief.customer_goal}</strong></div>
          {expanded && dynamicEntries.map(([key, value]) => (
            <div className="brief-row" key={key}><small>{key.replaceAll("_", " ")}</small><strong>{String(value)}</strong></div>
          ))}
        </div>
        {dynamicEntries.length > 0 && (
          <button className="more-details-toggle" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Less details" : "More details..."}
          </button>
        )}
      </div>
    </div>
  );
}
