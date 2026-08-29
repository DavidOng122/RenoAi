"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { localStore, type RepairRequest } from "@/lib/local-store";

function route(item: RepairRequest) {
  if (item.status === "ready") return `/repair/${item.id}/result`;
  if (item.status === "analysing") return `/repair/${item.id}/processing`;
  if (item.status === "review") return `/repair/${item.id}/review`;
  return `/repair/${item.id}/clarify`;
}

function RequestCard({ item }: { item: RepairRequest }) {
  const brief = item.analysis?.problem_brief;
  const title = brief ? `${brief.location}  ${brief.affected_item.toLowerCase()}` : item.category_hint || item.description.slice(0, 40) || "New repair";
  const locationLine = "HDB . Tampines";
  const photo = item.evidence.photos[0];
  const pricing = item.project?.pricing;
  const duration = item.project?.repair.estimated_duration;
  return (
    <Link className="requests-card" href={route(item)}>
      {photo ? <img className="requests-card-photo" src={photo.thumbnail_url || photo.storage_url} alt=""/> : <div className="requests-card-photo requests-card-photo-placeholder"/>}
      <div className="requests-card-body">
        <div>
          <p className="requests-card-title">{title}</p>
          <p className="requests-card-location">{locationLine}</p>
        </div>
        <div className="requests-card-meta">
          {pricing?.available
            ? <><span>S${pricing.estimated_min_price} - {pricing.estimated_max_price}</span><span>{duration}</span></>
            : <span className="badge">{item.status.replace("_", " ")}</span>}
        </div>
      </div>
    </Link>
  );
}

export function RequestList() {
  const [items, setItems] = useState<RepairRequest[]>([]);
  useEffect(() => { const sync = () => setItems(localStore.requests()); sync(); window.addEventListener("renoai:change", sync); return () => window.removeEventListener("renoai:change", sync); }, []);
  if (!items.length) return <div className="empty">Nothing here yet.</div>;
  return <div className="requests-list">{items.map((item) => <RequestCard item={item} key={item.id}/>)}</div>;
}
