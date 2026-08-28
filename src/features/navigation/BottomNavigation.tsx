"use client";

import Link from "next/link";
import { Home, ClipboardList } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const path = usePathname();
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <Link className={cn("nav-link", path.startsWith("/home") && "active")} href="/home"><Home size={17}/> Home</Link>
      <Link className={cn("nav-link", path.startsWith("/requests") && "active")} href="/requests"><ClipboardList size={17}/> Requests</Link>
    </nav>
  );
}
