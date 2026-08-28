"use client";

import type { Property } from "@/schemas/property.schema";
import type { ProblemAnalysis } from "@/schemas/problem-brief.schema";
import type { MediaItem, ProjectBrief, RequestStatus } from "@/schemas/project-brief.schema";

export type RepairRequest = {
  id: string;
  property_id: string;
  description: string;
  category_hint?: string;
  status: RequestStatus;
  created_at: string;
  analysis?: ProblemAnalysis;
  project?: ProjectBrief;
  evidence: { photos: MediaItem[]; videos: MediaItem[] };
};

const PROPERTY_KEY = "renoai.properties";
const REQUEST_KEY = "renoai.requests";

export const demoProperty: Property = {
  id: "property_demo",
  user_id: "user_local",
  name: "My Home",
  home_type: "HDB",
  address: { postal_code: "570123", address_line: "123 Bishan Street", unit_number: "#10-123" },
  created_at: new Date().toISOString(),
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) || "") as T; } catch { return fallback; }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("renoai:change"));
}

export const localStore = {
  properties: () => read<Property[]>(PROPERTY_KEY, []),
  saveProperty(property: Property) {
    const current = this.properties().filter((item) => item.id !== property.id);
    write(PROPERTY_KEY, [property, ...current]);
  },
  selectedProperty: () => read<Property[]>(PROPERTY_KEY, [])[0] || demoProperty,
  requests: () => read<RepairRequest[]>(REQUEST_KEY, []),
  request(id: string) { return this.requests().find((item) => item.id === id); },
  saveRequest(request: RepairRequest) {
    const current = this.requests().filter((item) => item.id !== request.id);
    write(REQUEST_KEY, [request, ...current]);
  },
};
