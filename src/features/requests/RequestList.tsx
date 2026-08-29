"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { localStore, type RepairRequest } from "@/lib/local-store";

function route(item: RepairRequest) {
  if (item.status === "ready") return `/repair/${item.id}/result`;
  if (item.status === "analysing") return `/repair/${item.id}/processing`;
  if (item.status === "review") return `/repair/${item.id}/review`;
  return `/repair/${item.id}/clarify`;
}

function RequestCard({ item, onDelete }: { item: RepairRequest; onDelete: (item: RepairRequest) => void }) {
  const brief = item.analysis?.problem_brief;
  const property = localStore.selectedProperty();
  const title = brief
    ? `${brief.location} ${brief.affected_item.toLowerCase()}`
    : item.category_hint || item.description.slice(0, 42) || "New repair";
  const locationLine = `${property.home_type} · ${property.name}`;
  const photo = item.evidence.photos[0];
  const pricing = item.project?.pricing;
  const duration = item.project?.repair.estimated_duration;

  return (
    <article className="requests-card">
      <Link className="requests-card-link" href={route(item)}>
        {photo
          ? <img className="requests-card-photo" src={photo.thumbnail_url || photo.storage_url} alt="Repair evidence" />
          : <div className="requests-card-photo requests-card-photo-placeholder" aria-hidden />}
        <div className="requests-card-body">
          <div className="requests-card-heading">
            <h2>{title}</h2>
            <p>{locationLine}</p>
          </div>
          <div className="requests-card-meta">
            {pricing?.available
              ? <><span>S${pricing.estimated_min_price} – S${pricing.estimated_max_price}</span>{duration && <span>{duration}</span>}</>
              : <span>{item.status.replaceAll("_", " ")}</span>}
          </div>
        </div>
      </Link>
      <button
        className="requests-delete"
        type="button"
        aria-label={`Delete ${title}`}
        title="Delete request"
        onClick={() => onDelete(item)}
      >
        <Trash2 aria-hidden size={16} strokeWidth={1.8} />
      </button>
    </article>
  );
}

export function RequestList() {
  const [items, setItems] = useState<RepairRequest[]>([]);
  useEffect(() => { const sync = () => setItems(localStore.requests()); sync(); void localStore.syncFromCloud(); window.addEventListener("renoai:change", sync); return () => window.removeEventListener("renoai:change", sync); }, []);

  function deleteRequest(item: RepairRequest) {
    const title = item.analysis?.problem_brief.affected_item || item.category_hint || "this request";
    if (!window.confirm(`Delete ${title}? This cannot be undone.`)) return;
    localStore.deleteRequest(item.id);
  }

  if (!items.length) return <div className="requests-empty">No saved repair briefs yet.</div>;
  return <div className="requests-list">{items.map((item) => <RequestCard item={item} key={item.id} onDelete={deleteRequest} />)}</div>;
}
