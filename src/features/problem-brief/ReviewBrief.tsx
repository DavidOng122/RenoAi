"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { localStore, type RepairRequest } from "@/lib/local-store";
import { ProblemBriefCard } from "./ProblemBriefCard";
import type { ProblemBrief } from "@/schemas/problem-brief.schema";
import { ArrowRight, ChevronDown, ClipboardList, Home, Pencil, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Property } from "@/schemas/property.schema";

export function ReviewBrief() {
  const { requestId } = useParams<{ requestId: string }>(); const router = useRouter();
  const [item, setItem] = useState<RepairRequest>(); const [editing, setEditing] = useState(false); const [brief, setBrief] = useState<ProblemBrief>();
  const [property, setProperty] = useState<Property>();
  useEffect(() => { const r = localStore.request(requestId); setItem(r); setBrief(r?.analysis?.problem_brief); setProperty(localStore.selectedProperty()); }, [requestId]);
  if (!item || !brief) return <div className="brief-shell"><div className="empty">Request not found.</div></div>;
  const currentItem = item;
  const currentBrief = brief;
  const pageTitle = currentItem.category_hint || `${brief.location} ${brief.affected_item.toLowerCase()} issue`;
  function update(key: keyof ProblemBrief, value: string) { setBrief((old) => old ? { ...old, [key]: value } : old); }
  function save() { const next = { ...currentItem, analysis: { ...currentItem.analysis!, problem_brief: currentBrief } }; localStore.saveRequest(next); setItem(next); setEditing(false); }
  function confirm() { const next = { ...currentItem, status: "analysing" as const, analysis: { ...currentItem.analysis!, problem_brief: currentBrief } }; localStore.saveRequest(next); router.push(`/repair/${currentItem.id}/processing`); }
  return <div className="brief-shell">
    <header className="brief-topbar">
      <Link className="brief-property-pill" href="/onboarding"><Home size={16}/>{property ? `${property.home_type} . ${property.name}` : "My Home"}<ChevronDown size={8}/></Link>
      <Link className="brief-avatar" href="/home" aria-label="Account"><User size={18}/></Link>
    </header>
    <div className="brief-title-row">{pageTitle}<ChevronDown size={12}/></div>
    {editing ? <div className="card stack">{(["location","affected_item","observed_problem","duration","condition","customer_goal"] as const).map((key) => <div className="field" key={key}><label>{key.replaceAll("_", " ")}</label><textarea rows={key === "observed_problem" ? 3 : 2} value={brief[key] || ""} onChange={(e) => update(key, e.target.value)}/></div>)}<div className="actions"><button className="primary-btn" onClick={save}>Save changes</button><button className="secondary-btn" onClick={() => setEditing(false)}>Cancel</button></div></div> : <ProblemBriefCard brief={brief} description={currentItem.description} photos={currentItem.evidence.photos}/>}
    {!editing && <div className="actions"><button className="secondary-btn" onClick={() => setEditing(true)}><Pencil size={16}/> Edit</button><button className="primary-btn" onClick={confirm}>Confirm & analyse <ArrowRight size={17}/></button></div>}
    <BriefBottomNav/>
  </div>;
}

function BriefBottomNav() {
  const path = usePathname();
  return <nav className="brief-bottom-nav" aria-label="Primary navigation">
    <Link className={cn("brief-nav-item", path.startsWith("/home") && "active")} href="/home"><Home size={19}/><span>Home</span>{path.startsWith("/home") && <i className="brief-nav-underline"/>}</Link>
    <Link className={cn("brief-nav-item", path.startsWith("/requests") && "active")} href="/requests"><ClipboardList size={16}/><span>Requests</span></Link>
  </nav>;
}
