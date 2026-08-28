"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { localStore, type RepairRequest } from "@/lib/local-store";

function route(item: RepairRequest) {
  if (item.status === "ready") return `/repair/${item.id}/result`;
  if (item.status === "analysing") return `/repair/${item.id}/processing`;
  if (item.status === "review") return `/repair/${item.id}/review`;
  return `/repair/${item.id}/clarify`;
}

function Cards({ items }: { items: RepairRequest[] }) {
  if (!items.length) return <div className="empty">Nothing here yet.</div>;
  return <div className="stack">{items.map((item) => <Link className="request-card" href={route(item)} key={item.id}><div><h3>{item.analysis?.problem_brief.affected_item || item.category_hint || "New repair"}</h3><div className="muted">{item.analysis?.problem_brief.location || item.description.slice(0, 60)}</div></div><div style={{display:"flex",alignItems:"center",gap:12}}><span className="badge">{item.status.replace("_", " ")}</span><ArrowRight size={18}/></div></Link>)}</div>;
}

export function RequestList() {
  const [items, setItems] = useState<RepairRequest[]>([]);
  useEffect(() => { const sync = () => setItems(localStore.requests()); sync(); window.addEventListener("renoai:change", sync); return () => window.removeEventListener("renoai:change", sync); }, []);
  const active = items.filter((i) => i.status !== "ready"); const ready = items.filter((i) => i.status === "ready");
  return <div className="stack" style={{gap:34}}><section><div className="section-label">ACTIVE · {active.length}</div><Cards items={active}/></section><section><div className="section-label">READY · {ready.length}</div><Cards items={ready}/></section></div>;
}
