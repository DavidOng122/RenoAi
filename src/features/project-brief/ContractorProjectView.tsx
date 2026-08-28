"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { localStore, type RepairRequest } from "@/lib/local-store";
import { ProblemBriefCard } from "@/features/problem-brief/ProblemBriefCard";
import { Download } from "lucide-react";

export function ContractorProjectView() {
  const { requestId } = useParams<{requestId:string}>(); const [item,setItem]=useState<RepairRequest>();
  useEffect(()=>setItem(localStore.request(requestId)),[requestId]);
  const project=item?.project;
  if(!project) return <AppShell navigation={false}><div className="empty">Project not found.</div></AppShell>;
  return <AppShell navigation={false}><div className="page-head"><div><div className="eyebrow">Contractor project brief</div><h1>{project.problem.location} · {project.problem.affected_item}</h1><p className="muted">Reference {project.request_id}</p></div><button className="secondary-btn no-print" onClick={()=>window.print()}><Download size={16}/> Save PDF</button></div>
    <div className="stack">
      <section><div className="section-label">PROPERTY & PROBLEM CONTEXT</div><ProblemBriefCard brief={project.problem}/></section>
      <div className="two-col"><section className="card"><div className="section-label">LIKELY ISSUE</div><h2>{project.repair.likely_issue}</h2><p><span className="badge">{project.repair.urgency} urgency</span></p></section><section className="card"><div className="section-label">RECOMMENDED WORK</div><p style={{fontSize:18,lineHeight:1.55}}>{project.repair.recommended_work}</p></section></div>
      <div className="detail-list"><div className="detail"><small>Estimated duration</small><strong>{project.repair.estimated_duration}</strong></div><div className="detail"><small>Site visit required</small><strong>{project.repair.site_visit_required?"Yes":"No"}</strong></div><div className="detail"><small>Confidence</small><strong>{project.repair.confidence}</strong></div><div className="detail"><small>Estimated price</small><strong>{project.pricing.available?`S$${project.pricing.estimated_min_price} – S$${project.pricing.estimated_max_price}`:"Unavailable"}</strong></div></div>
      <section className="card"><div className="section-label">EVIDENCE</div><strong>{project.evidence.photos.length} photo(s) · {project.evidence.videos.length} video(s)</strong>{project.evidence.videos.length>0&&<p className="muted">Video evidence available in the digital project.</p>}</section>
    </div>
  </AppShell>;
}
