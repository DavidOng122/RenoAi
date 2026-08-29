"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, LogOut } from "lucide-react";
import { BottomNavigation } from "@/features/navigation/BottomNavigation";
import { signOutAction } from "@/app/actions/auth";
import { localStore } from "@/lib/local-store";
import { useEffect, useState } from "react";
import type { Property } from "@/schemas/property.schema";

export function AppShell({ children, navigation = true }: { children: React.ReactNode; navigation?: boolean }) {
  const [property, setProperty] = useState<Property>();
  useEffect(() => {
    const sync = () => setProperty(localStore.selectedProperty());
    sync(); window.addEventListener("renoai:change", sync);
    return () => window.removeEventListener("renoai:change", sync);
  }, []);
  return (
    <div className="shell">
      <header className="topbar">
        <Link className="brand" href="/home"><Image className="brand-mark" src="/brand/renoai-mark.png" alt="" width={34} height={34}/> RenoaAI</Link>
        <div className="topbar-actions">
          <Link className="property-pill" href="/onboarding"><span>{property?.name || "My Home"}</span><ChevronDown size={15}/></Link>
          <form action={signOutAction}>
            <button className="signout-button" type="submit" aria-label="Sign out" title="Sign out"><LogOut size={17}/></button>
          </form>
        </div>
      </header>
      <main className="main">{children}</main>
      {navigation && <BottomNavigation />}
    </div>
  );
}
