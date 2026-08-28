"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { localStore, type RepairRequest } from "@/lib/local-store";
import { ArrowRight } from "lucide-react";

export function ClarificationForm() {
  const { requestId } = useParams<{ requestId: string }>();
  const router = useRouter();
  const [item, setItem] = useState<RepairRequest>();
  const [answers, setAnswers] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => { const value = localStore.request(requestId); setItem(value); setAnswers(value?.analysis?.missing_questions.map(() => "") || []); }, [requestId]);
  if (!item?.analysis) return <AppShell><div className="empty">Request not found.</div></AppShell>;
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const response = await fetch("/api/clarify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ request_id: item!.id, property: localStore.selectedProperty(), description: item!.description, category_hint: item!.category_hint, clarification: item!.analysis!.missing_questions.map((q, i) => `${q} ${answers[i]}`).join("\n") }) });
    const analysis = await response.json();
    const next = { ...item!, analysis, status: analysis.is_complete ? "review" as const : "collecting_info" as const };
    localStore.saveRequest(next); setBusy(false);
    router.push(analysis.is_complete ? `/repair/${item!.id}/review` : `/repair/${item!.id}/clarify`);
    router.refresh();
  }
  return <AppShell><div className="page-head"><div><div className="eyebrow">One quick check</div><h1>Help us fill the gaps.</h1></div></div><form className="card stack" onSubmit={submit} style={{maxWidth:720}}>{item.analysis.missing_questions.map((question, index) => <div className="field" key={question}><label>{question}</label><textarea rows={3} required value={answers[index] || ""} onChange={(e) => setAnswers((old) => old.map((a, i) => i === index ? e.target.value : a))}/></div>)}<button disabled={busy} className="primary-btn">{busy ? "Updating…" : "Update brief"} <ArrowRight size={17}/></button></form></AppShell>;
}
