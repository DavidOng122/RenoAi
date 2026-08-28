"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { localStore } from "@/lib/local-store";
import { newId } from "@/lib/utils";
import type { Property } from "@/schemas/property.schema";

export function OnboardingForm() {
  const router = useRouter();
  const existing = typeof window !== "undefined" ? localStore.selectedProperty() : undefined;
  const [homeType, setHomeType] = useState<Property["home_type"]>(existing?.home_type || "HDB");
  const [name, setName] = useState(existing?.name || "My Home");
  const [postal, setPostal] = useState(existing?.address.postal_code || "");
  const [address, setAddress] = useState(existing?.address.address_line || "");
  const [unit, setUnit] = useState(existing?.address.unit_number || "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    localStore.saveProperty({
      id: existing?.id || newId("property"), user_id: "user_local", name, home_type: homeType,
      address: { postal_code: postal, address_line: address, ...(unit ? { unit_number: unit } : {}) },
      created_at: existing?.created_at || new Date().toISOString(),
    });
    router.push("/home");
  }

  return (
    <form className="card stack" onSubmit={submit}>
      <div className="field"><label>Property name</label><input value={name} onChange={(e) => setName(e.target.value)} required /></div>
      <div className="field"><label>Home type</label><select value={homeType} onChange={(e) => setHomeType(e.target.value as Property["home_type"])}><option>HDB</option><option>Condo</option><option>Landed</option></select></div>
      <div className="two-col">
        <div className="field"><label>Postal code</label><input inputMode="numeric" maxLength={6} placeholder="570123" value={postal} onChange={(e) => setPostal(e.target.value)} required /></div>
        <div className="field"><label>Unit number (optional)</label><input placeholder="#10-123" value={unit} onChange={(e) => setUnit(e.target.value)} /></div>
      </div>
      <div className="field"><label>Address</label><input placeholder="123 Bishan Street" value={address} onChange={(e) => setAddress(e.target.value)} required /></div>
      <button className="primary-btn" type="submit">Save property <ArrowRight size={17}/></button>
    </form>
  );
}
