"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { localStore, type RepairRequest } from "@/lib/local-store";
import { ProblemBriefCard } from "./ProblemBriefCard";
import type { ProblemBrief } from "@/schemas/problem-brief.schema";
import { ArrowRight, Pencil } from "lucide-react";

export function ReviewBrief() {
  const { requestId } = useParams<{ requestId: string }>(); const router = useRouter();
  const [item, setItem] = useState<RepairRequest>(); const [editing, setEditing] = useState(false); const [brief, setBrief] = useState<ProblemBrief>();
  useEffect(() => { const r = localStore.request(requestId); setItem(r); setBrief(r?.analysis?.problem_brief); }, [requestId]);
  if (!item || !brief) return <AppShell><div className="empty">Request not found.</div></AppShell>;
  const currentItem = item;
  const currentBrief = brief;
  function update(key: keyof ProblemBrief, value: string) { setBrief((old) => old ? { ...old, [key]: value } : old); }
  function save() { const next = { ...currentItem, analysis: { ...currentItem.analysis!, problem_brief: currentBrief } }; localStore.saveRequest(next); setItem(next); setEditing(false); }
  function confirm() { const next = { ...currentItem, status: "analysing" as const, analysis: { ...currentItem.analysis!, problem_brief: currentBrief } }; localStore.saveRequest(next); router.push(`/repair/${currentItem.id}/processing`); }
  return <AppShell><div className="page-head"><div><div className="eyebrow">Problem brief</div><h1>Did we get this right?</h1><p className="muted">This confirmed version is what both repair and price analysis will use.</p></div></div>
    {editing ? <div className="card stack">{(["location","affected_item","observed_problem","duration","condition","customer_goal"] as const).map((key) => <div className="field" key={key}><label>{key.replaceAll("_", " ")}</label><textarea rows={key === "observed_problem" ? 3 : 2} value={brief[key] || ""} onChange={(e) => update(key, e.target.value)}/></div>)}<div className="actions"><button className="primary-btn" onClick={save}>Save changes</button><button className="secondary-btn" onClick={() => setEditing(false)}>Cancel</button></div></div> : <ProblemBriefCard brief={brief}/>} 
    {!editing && <div className="actions"><button className="secondary-btn" onClick={() => setEditing(true)}><Pencil size={16}/> Edit</button><button className="primary-btn" onClick={confirm}>Confirm & analyse <ArrowRight size={17}/></button></div>}
  </AppShell>;
}
