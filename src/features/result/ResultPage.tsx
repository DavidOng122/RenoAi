"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { localStore, type RepairRequest } from "@/lib/local-store";
import { UserProjectView } from "@/features/project-brief/UserProjectView";

export function ResultPage() {
  const router = useRouter();
  const { requestId } = useParams<{ requestId: string }>(); const [item, setItem] = useState<RepairRequest>();
  useEffect(() => {
    let cancelled = false;
    const request = localStore.request(requestId);
    setItem(request);
    if (!request?.project || request.project.pricing.available) return;

    fetch("/api/price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problem: request.project.problem }),
    })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((pricing) => {
        if (cancelled || !pricing.available) return;
        const next: RepairRequest = { ...request, project: { ...request.project!, pricing } };
        localStore.saveRequest(next);
        setItem(next);
      })
      .catch(() => undefined);

    return () => { cancelled = true; };
  }, [requestId]);

  function goBack() {
    const previousPageIsInApp = document.referrer
      ? new URL(document.referrer).origin === window.location.origin
      : false;
    if (previousPageIsInApp) router.back();
    else router.push("/requests");
  }

  return (
    <main className="result-brief-page">
      <div className="result-back-row">
        <button className="result-back-button" type="button" aria-label="Go back" onClick={goBack}>
          <ChevronLeft aria-hidden size={24} strokeWidth={1.8} />
        </button>
      </div>
      {item?.project
        ? <UserProjectView project={item.project} description={item.description} category={item.category_hint} />
        : <div className="result-brief-empty">Project not found or still processing.</div>}
    </main>
  );
}
