"use client";

import { useEffect, useState } from "react";
import { MobileHeader, MobileBottomNav } from "@/components/MobileShell";
import { RequestList } from "@/features/requests/RequestList";
import { localStore } from "@/lib/local-store";
import type { Property } from "@/schemas/property.schema";

export default function RequestsPage() {
  const [property, setProperty] = useState<Property>();
  useEffect(() => {
    const sync = () => setProperty(localStore.selectedProperty());
    sync(); window.addEventListener("renoai:change", sync);
    return () => window.removeEventListener("renoai:change", sync);
  }, []);
  return <div className="brief-shell">
    <MobileHeader property={property}/>
    <h1 className="requests-title">Request</h1>
    <p className="requests-subtitle">Your saved repair brief</p>
    <RequestList/>
    <MobileBottomNav/>
  </div>;
}
