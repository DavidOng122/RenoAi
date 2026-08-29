"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { localStore, type RepairRequest } from "@/lib/local-store";
import { ProblemBriefCard } from "./ProblemBriefCard";
import type { ProblemBrief } from "@/schemas/problem-brief.schema";
import { ArrowRight, Pencil } from "lucide-react";

export function ReviewBrief() {
  const { requestId } = useParams<{ requestId: string }>(); const router = useRouter();
  const [item, setItem] = useState<RepairRequest>(); const [editing, setEditing] = useState(false); const [brief, setBrief] = useState<ProblemBrief>(); const [expanded, setExpanded] = useState(false);
  useEffect(() => { const r = localStore.request(requestId); setItem(r); setBrief(r?.analysis?.problem_brief); }, [requestId]);
  if (!item || !brief) return <main className="brief-shell analysis-review-page agent-flow-page"><div className="requests-empty">Request not found.</div></main>;
  const currentItem = item;
  const currentBrief = brief;
  function update(key: keyof ProblemBrief, value: string) { setBrief((old) => old ? { ...old, [key]: value } : old); }
  function save() { const next = { ...currentItem, analysis: { ...currentItem.analysis!, problem_brief: currentBrief } }; localStore.saveRequest(next); setItem(next); setEditing(false); }
  function confirm() { const next = { ...currentItem, status: "analysing" as const, analysis: { ...currentItem.analysis!, problem_brief: currentBrief } }; localStore.saveRequest(next); router.push(`/repair/${currentItem.id}/processing?stage=project`); }
  const firstPhoto = item.evidence.photos[0];
  const remainingPhotos = Math.max(0, item.evidence.photos.length - 1);

  return (
    <main className="brief-shell analysis-review-page agent-flow-page" data-node-id="104:192">
      <div className="analysis-user-message">
        {firstPhoto
          ? <span className="analysis-message-photo"><img src={firstPhoto.thumbnail_url || firstPhoto.storage_url} alt="Repair evidence" />{remainingPhotos > 0 && <i>+{remainingPhotos}</i>}</span>
          : <span className="analysis-message-photo" aria-hidden />}
        <p>{item.description}</p>
      </div>

      <ProblemBriefCard
        variant="analysis"
        brief={brief}
        photos={item.evidence.photos}
        expanded={expanded}
        onToggle={() => setExpanded((value) => !value)}
        footer={!editing && (
          <div className="analysis-review-actions analysis-card-actions">
            <button className="analysis-edit-button" type="button" onClick={() => setEditing(true)}><Pencil size={14} /> Edit</button>
            <button className="analysis-confirm-button" type="button" onClick={confirm}>Continue <ArrowRight size={14} /></button>
          </div>
        )}
      />
      {editing && (
        <section className="analysis-edit-panel">
          {(["location", "affected_item", "observed_problem", "duration", "condition", "customer_goal"] as const).map((key) => (
            <label key={key}><span>{key.replaceAll("_", " ")}</span><textarea rows={key === "observed_problem" ? 3 : 2} value={brief[key] || ""} onChange={(event) => update(key, event.target.value)} /></label>
          ))}
          <div className="analysis-review-actions"><button className="analysis-edit-button" type="button" onClick={() => setEditing(false)}>Cancel</button><button className="analysis-confirm-button" type="button" onClick={save}>Save changes</button></div>
        </section>
      )}
    </main>
  );
}
