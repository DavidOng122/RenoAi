"use client";

import { useEffect, useState } from "react";
import { Wrench } from "lucide-react";
import { MobileHeader, MobileBottomNav } from "@/components/MobileShell";
import { RepairComposer } from "@/features/repair-input/RepairComposer";
import { localStore } from "@/lib/local-store";
import type { Property } from "@/schemas/property.schema";

export default function HomePage() {
  const [property, setProperty] = useState<Property>();
  useEffect(() => {
    const sync = () => setProperty(localStore.selectedProperty());
    sync(); window.addEventListener("renoai:change", sync);
    return () => window.removeEventListener("renoai:change", sync);
  }, []);
  return <div className="brief-shell">
    <div className="home-logo"><span className="brand-mark"><Wrench size={17}/></span>RenoaAI</div>
    <MobileHeader property={property}/>
    <div className="home-hero">
      <h1>What needs fixing？</h1>
      <p>Add a photo and tell us<br/>what happend</p>
    </div>
    <RepairComposer/>
    <MobileBottomNav/>
  </div>;
}
