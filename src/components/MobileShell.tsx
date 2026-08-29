"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ClipboardList, Home, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Property } from "@/schemas/property.schema";

export function MobileHeader({ property }: { property?: Property }) {
  return (
    <header className="brief-topbar">
      <Link className="brief-property-pill" href="/onboarding"><Home size={16}/>{property ? `${property.home_type} . ${property.name}` : "My Home"}<ChevronDown size={8}/></Link>
      <Link className="brief-avatar" href="/home" aria-label="Account"><User size={18}/></Link>
    </header>
  );
}

export function MobileBottomNav() {
  const path = usePathname();
  const isHome = path.startsWith("/home");
  const isRequests = path.startsWith("/requests");
  return (
    <nav className="brief-bottom-nav" aria-label="Primary navigation">
      <Link className={cn("brief-nav-item", isHome && "active")} href="/home"><Home size={19}/><span>Home</span>{isHome && <i className="brief-nav-underline"/>}</Link>
      <Link className={cn("brief-nav-item", isRequests && "active")} href="/requests"><ClipboardList size={16}/><span>Requests</span>{isRequests && <i className="brief-nav-underline"/>}</Link>
    </nav>
  );
}
