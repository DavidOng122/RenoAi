"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { localStore, type RepairRequest } from "@/lib/local-store";
import { UserProjectView } from "@/features/project-brief/UserProjectView";

const figmaPreview: RepairRequest = {
  id: "figma-preview", property_id: "property_demo", description: "Water has been leaking under my kitchen sink since yesterday.", category_hint: "Water / Plumbing", status: "ready", created_at: "2026-08-29T00:00:00.000Z", evidence: { photos: [], videos: [] },
  project: {
    request_id: "figma-preview", status: "ready", evidence: { photos: [], videos: [] }, user_confirmation: { confirmed: true, confirmed_at: "2026-08-29T00:00:00.000Z" },
    problem: { request_id: "figma-preview", property_id: "property_demo", property: "HDB", location: "Tampines", affected_item: "Kitchen sink leakage", observed_problem: "Water has been leaking under my kitchen sink since yesterday.", duration: "since yesterday", condition: "Cabinet base is wet", customer_goal: "Stop the leak and prevent further water damage.", dynamic_details: {} },
    repair: { likely_issue: "Leakage around the drainage pipe connection.", urgency: "Medium", recommended_work: "Inspect sink drainage connection. Reseal or replace pipe joint. Test for leakage after repair.", estimated_duration: "1 – 2 hrs", site_visit_required: true, confidence: "High" },
    pricing: { estimated_min_price: 120, estimated_max_price: 250, currency: "SGD", available: true },
  },
};

export function ResultPage() {
  const { requestId } = useParams<{ requestId: string }>(); const [item, setItem] = useState<RepairRequest>(figmaPreview);
  useEffect(() => setItem(localStore.request(requestId) || figmaPreview), [requestId]);
  return <AppShell header={false}><UserProjectView project={item.project!} description={item.description} category={item.category_hint}/></AppShell>;
}
