"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { localStore, type RepairRequest } from "@/lib/local-store";
import { UserProjectView } from "@/features/project-brief/UserProjectView";

export function ResultPage() {
  const { requestId } = useParams<{ requestId: string }>(); const [item, setItem] = useState<RepairRequest>();
  useEffect(() => setItem(localStore.request(requestId)), [requestId]);
  return <AppShell><div className="page-head"><div><div className="eyebrow">Analysis complete</div><h1>Your repair, made actionable.</h1></div></div>{item?.project ? <UserProjectView project={item.project}/> : <div className="empty">Project not found or still processing.</div>}</AppShell>;
}
