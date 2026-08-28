"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { localStore } from "@/lib/local-store";

export function AnalysisProgress() {
  const { requestId } = useParams<{ requestId: string }>(); const router = useRouter(); const started = useRef(false); const [error, setError] = useState("");
  useEffect(() => {
    if (started.current) return; started.current = true;
    const item = localStore.request(requestId);
    if (!item?.analysis) { setError("Request not found."); return; }
    fetch("/api/analyse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ problem: item.analysis.problem_brief, evidence: item.evidence }) })
      .then(async (response) => { if (!response.ok) throw new Error(); const project = await response.json(); localStore.saveRequest({ ...item, status: "ready", project }); router.replace(`/repair/${requestId}/result`); })
      .catch(() => setError("Analysis could not be completed. Please return to the review and try again."));
  }, [requestId, router]);
  return <AppShell navigation={false}><div style={{maxWidth:620, margin:"9vh auto", textAlign:"center"}}><div className="eyebrow">Building your project brief</div><div className="loading-orbit"/><h2 style={{fontSize:34}}>Repair and pricing are being checked in parallel.</h2><p className="muted">We’ll keep the repair advice independent from the price estimate.</p>{error && <p style={{color:"#a53318"}}>{error}</p>}</div></AppShell>;
}
