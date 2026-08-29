"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Home, Plus, Trash2, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { localStore } from "@/lib/local-store";
import { cn } from "@/lib/utils";
import type { Property } from "@/schemas/property.schema";

export type MobileAccountUser = { name?: string | null; email?: string | null; image?: string | null };

export function AccountAvatar({ user, className = "brief-avatar", href = "/settings" }: { user?: MobileAccountUser; className?: string; href?: string | null }) {
  const initial = user?.name?.trim().charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase();
  const content = user?.image
    ? <img src={user.image} alt="" referrerPolicy="no-referrer" />
    : initial
      ? <span aria-hidden>{initial}</span>
      : <UserRound aria-hidden size={18} strokeWidth={1.8} />;

  return href
    ? <Link className={className} href={href} aria-label="Open settings">{content}</Link>
    : <span className={className}>{content}</span>;
}

export function MobileHeader({ variant = "default", user }: { variant?: "default" | "analysis"; user?: MobileAccountUser }) {
  const [property, setProperty] = useState<Property>();
  const [properties, setProperties] = useState<Property[]>([]);
  const [open, setOpen] = useState(false);
  const controlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => {
      setProperty(localStore.selectedProperty());
      setProperties(localStore.properties());
    };
    sync();
    void localStore.syncFromCloud();
    window.addEventListener("renoai:change", sync);
    return () => window.removeEventListener("renoai:change", sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!controlRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [open]);

  const options = properties;

  function chooseProperty(item: Property) {
    localStore.selectProperty(item.id);
    setOpen(false);
  }

  function deleteProperty(item: Property) {
    if (!window.confirm(`Delete ${item.home_type} · ${item.name}? This cannot be undone.`)) return;
    localStore.deleteProperty(item.id);
  }

  return (
    <header className={cn("brief-topbar", variant === "analysis" && "analysis-topbar")}>
      <div className="brief-property-control" ref={controlRef}>
        <button
          className="brief-property-pill"
          type="button"
          aria-expanded={open}
          aria-controls="property-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {variant === "analysis"
            ? <Image src="/analysis/property-home.svg" alt="" width={17} height={16} />
            : <Home aria-hidden size={16} strokeWidth={1.8} />}
          <span>{property
            ? `${property.home_type} · ${variant === "analysis" ? property.address.address_line || property.name : property.name}`
            : "My Home"}</span>
          {variant === "analysis"
            ? <Image className={cn("brief-property-chevron", open && "open")} src="/analysis/property-chevron.svg" alt="" width={8} height={5} />
            : <ChevronDown className={cn("brief-property-chevron", open && "open")} aria-hidden size={10} strokeWidth={1.8} />}
        </button>

        {open && (
          <div className="brief-property-menu" id="property-menu" role="menu">
            <p className="brief-property-menu-label">Your properties</p>
            <div className="brief-property-options">
              {options.map((item) => {
                const selected = item.id === property?.id;
                return (
                  <div className={cn("brief-property-option-row", selected && "selected")} key={item.id}>
                    <button className="brief-property-option" type="button" role="menuitemradio" aria-checked={selected} onClick={() => chooseProperty(item)}>
                      <span className="brief-property-option-icon"><Home aria-hidden size={16} strokeWidth={1.8} /></span>
                      <span className="brief-property-option-copy">
                        <strong>{item.home_type} · {item.name}</strong>
                        <small>{item.address.address_line || "Address not added"}</small>
                      </span>
                      {selected && <Check className="brief-property-check" aria-hidden size={16} strokeWidth={2} />}
                    </button>
                    <button
                      className="brief-property-delete"
                      type="button"
                      role="menuitem"
                      aria-label={`Delete ${item.home_type} · ${item.name}`}
                      title="Delete property"
                      onClick={() => deleteProperty(item)}
                    >
                      <Trash2 aria-hidden size={15} strokeWidth={1.8} />
                    </button>
                  </div>
                );
              })}
            </div>
            <Link className="brief-add-property" href="/onboarding?mode=new" role="menuitem" onClick={() => setOpen(false)}>
              <span><Plus aria-hidden size={17} strokeWidth={1.8} /></span>
              Add property
            </Link>
          </div>
        )}
      </div>
      <AccountAvatar user={user} />
    </header>
  );
}

export function MobileBottomNav() {
  const path = usePathname();
  const isHome = path.startsWith("/home") || path.startsWith("/repair");
  const isRequests = path.startsWith("/requests");

  return (
    <nav className="brief-bottom-nav" aria-label="Primary navigation">
      <Link className={cn("brief-nav-item", isHome && "active")} href="/home">
        <span className="brief-nav-icon home" aria-hidden />
        <span>Home</span>
        {isHome && <i className="brief-nav-underline" aria-hidden />}
      </Link>
      <Link className={cn("brief-nav-item", isRequests && "active")} href="/requests">
        <span className="brief-nav-icon requests" aria-hidden />
        <span>Requests</span>
        {isRequests && <i className="brief-nav-underline" aria-hidden />}
      </Link>
    </nav>
  );
}
