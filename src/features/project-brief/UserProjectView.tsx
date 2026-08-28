"use client";

import Link from "next/link";
import type { ProjectBrief } from "@/schemas/project-brief.schema";
import { ProblemBriefCard } from "@/features/problem-brief/ProblemBriefCard";
import { ArrowUpRight, Download } from "lucide-react";

export function UserProjectView({ project }: { project: ProjectBrief }) {
  return <div className="stack">
    <section className="card" style={{background:"var(--green)", color:"white"}}><span className="badge" style={{background:"var(--lime)"}}>Project ready</span><div style={{marginTop:24}}><div style={{opacity:.65, marginBottom:8}}>Estimated price</div>{project.pricing.available ? <div className="price" style={{color:"white"}}>S${project.pricing.estimated_min_price} – S${project.pricing.estimated_max_price}</div> : <h2>Price unavailable</h2>}<p style={{opacity:.7}}>Indicative range only. Final quote may change after inspection.</p></div></section>
    <div className="two-col">
      <section className="card"><div className="section-label">Likely issue</div><h2>{project.repair.likely_issue}</h2><div className="actions"><span className={project.repair.urgency === "High" ? "badge high" : "badge"}>{project.repair.urgency} urgency</span><span className="badge">{project.repair.confidence} confidence</span></div></section>
      <section className="card"><div className="section-label">Recommended work</div><p style={{fontSize:18,lineHeight:1.55,margin:0}}>{project.repair.recommended_work}</p></section>
    </div>
    <div className="detail-list"><div className="detail"><small>Estimated duration</small><strong>{project.repair.estimated_duration}</strong></div><div className="detail"><small>Site visit</small><strong>{project.repair.site_visit_required ? "Required" : "May not be required"}</strong></div></div>
    <section><div className="section-label">Confirmed problem</div><ProblemBriefCard brief={project.problem}/></section>
    <div className="actions no-print"><Link className="primary-btn" href={`/requests/${project.request_id}/contractor`}>Contractor view <ArrowUpRight size={17}/></Link><button className="secondary-btn" onClick={() => window.print()}><Download size={16}/> Save as PDF</button></div>
  </div>;
}
