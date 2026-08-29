"use client";

import Link from "next/link";
import { ChevronDown, Wrench } from "lucide-react";
import { BottomNavigation } from "@/features/navigation/BottomNavigation";
import { localStore } from "@/lib/local-store";
import { useEffect, useState } from "react";
import type { Property } from "@/schemas/property.schema";

export function AppShell({ children, navigation = true, header = true }: { children: React.ReactNode; navigation?: boolean; header?: boolean }) {
  const [property, setProperty] = useState<Property>();
  useEffect(() => {
    const sync = () => setProperty(localStore.selectedProperty());
    sync(); window.addEventListener("renoai:change", sync);
    return () => window.removeEventListener("renoai:change", sync);
  }, []);
  return (
    <div className="shell">
      {header && <header className="topbar">
        <Link className="brand" href="/home"><span className="brand-mark"><Wrench size={18}/></span> RenoAI</Link>
        <Link className="property-pill" href="/onboarding"><span>{property?.name || "My Home"}</span><ChevronDown size={15}/></Link>
      </header>}
      <main className="main">{children}</main>
      {navigation && <BottomNavigation />}
    </div>
  );
}
