"use client";

import type { ProjectBrief } from "@/schemas/project-brief.schema";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  BookmarkCheck,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
  Image as ImageIcon,
  Lightbulb,
  MapPin,
  Sparkles,
  Table2,
  WalletCards,
  Wrench,
} from "lucide-react";

type RequestBriefProps = { project: ProjectBrief; description?: string; category?: string };

function money(project: ProjectBrief) {
  return project.pricing.available
    ? `S$${project.pricing.estimated_min_price} – ${project.pricing.estimated_max_price}`
    : "On assessment";
}

function humanise(value?: string) {
  return value?.replaceAll("_", " ") || "General repair";
}

export function UserProjectView({ project, description, category }: RequestBriefProps) {
  const router = useRouter();
  const price = money(project);
  const photo = project.evidence.photos[0]?.thumbnail_url || project.evidence.photos[0]?.storage_url;
  const isKitchenLeak = project.problem.affected_item.toLowerCase().includes("kitchen sink");
  const observations = isKitchenLeak
    ? ["Water visible under the sink", "Leak appears near the pipe joint", "Cabinet base is wet"]
    : [
        `Issue reported at ${project.problem.location.toLowerCase()}`,
        project.problem.duration ? `Present for ${project.problem.duration.toLowerCase()}` : "Condition needs confirmation on site",
        project.problem.condition || "Repair area should be inspected before work starts",
      ];
  const trade = category?.toLowerCase().includes("water") ? "Plumbing" : category || "General repair";
  const work = project.repair.recommended_work
    .split(/\n|;|\.(?=\s|$)/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <article className="request-brief">
      <section className="brief-hero">
        <div className="brief-overview">
          <div className="brief-ready"><BadgeCheck size={16} /> Brief ready</div>
          <h1>{humanise(project.problem.affected_item)}</h1>
          <p className="brief-location"><MapPin size={13} />{project.problem.property} · {project.problem.location}</p>
        </div>
        <div className="brief-photo">{photo && <img src={photo} alt="Repair evidence" />}</div>
      </section>

      <section className="brief-summary" aria-label="Estimate summary">
        <div><WalletCards size={17} /><span><small>Estimated price</small><strong>{price}</strong></span></div>
        <div><Clock3 size={17} /><span><small>Estimated duration</small><strong>{project.repair.estimated_duration}</strong></span></div>
      </section>

      <section className="brief-section input-section">
        <div className="brief-heading"><h2>Your input</h2><button type="button">Edit</button></div>
        <div className="input-content">
          <div className="input-photo">{photo && <img src={photo} alt="Submitted repair" />}</div>
          <div className="input-details">
            <div className="input-copy"><ImageIcon size={14} /><div><small>Description</small><p>{description || project.problem.observed_problem}</p></div></div>
            <div className="issue-type"><small><CircleAlert size={12} /> Issue type</small><span>{category || humanise(project.problem.affected_item)}</span></div>
          </div>
        </div>
      </section>

      <section className="brief-section assessment-section">
        <div className="brief-heading icon-heading"><Sparkles size={17} /><h2>AI assessment</h2></div>
        <div className="assessment-field"><small>Likely issue</small><strong>{project.repair.likely_issue}</strong></div>
        <div className="assessment-field"><small>Observed</small><div className="observations">{observations.map((observation) => <span key={observation}><CheckCircle2 size={13} />{observation}</span>)}</div></div>
        <div className="assessment-field urgency"><small>Urgency</small><strong><i className={project.repair.urgency.toLowerCase()} />{project.repair.urgency === "Medium" ? "Low to medium" : project.repair.urgency}</strong></div>
      </section>

      <section className="brief-section work-section">
        <div className="brief-heading icon-heading"><Wrench size={17} /><h2>Recommended work</h2></div>
        <div className="work-content">
          <ul>{(work.length ? work : [project.repair.recommended_work]).map((item) => <li key={item}>{item}</li>)}</ul>
          <div className="trade"><small>Trade required</small><span>{trade}</span></div>
        </div>
      </section>

      <section className="brief-section estimate-section">
        <div className="brief-heading icon-heading"><Table2 size={17} /><h2>Estimate</h2></div>
        <div className="estimate-grid">
          <div><small>Price range</small><strong>{price}</strong></div>
          <div><small>Estimated duration</small><strong>{project.repair.estimated_duration}</strong></div>
          <div><small>Site visit</small><strong>{project.repair.site_visit_required ? "Recommended" : "Not required"}</strong></div>
        </div>
        <p className="estimate-note"><Lightbulb size={15} /> Final scope and price may vary after on-site inspection.</p>
      </section>

      <div className="brief-actions no-print">
        <button className="save-request" type="button" onClick={() => router.push("/requests")}><BookmarkCheck size={17} /> Save request</button>
        <button className="export-brief" type="button" onClick={() => window.print()}><FileText size={17} /> Export PDF</button>
      </div>
    </article>
  );
}
