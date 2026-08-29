"use client";

import type { Property } from "@/schemas/property.schema";
import type { ProblemAnalysis } from "@/schemas/problem-brief.schema";
import type { MediaItem, ProjectBrief, RequestStatus } from "@/schemas/project-brief.schema";

export type ClarificationAnswer = { question: string; answer: string };

export type RepairRequest = {
  id: string;
  property_id: string;
  description: string;
  category_hint?: string;
  status: RequestStatus;
  created_at: string;
  analysis?: ProblemAnalysis;
  clarification_history?: ClarificationAnswer[];
  project?: ProjectBrief;
  evidence: { photos: MediaItem[]; videos: MediaItem[] };
};

const PROPERTY_KEY = "renoai.properties";
const SELECTED_PROPERTY_KEY = "renoai.selected-property";
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
    localStorage.setItem(SELECTED_PROPERTY_KEY, property.id);
    write(PROPERTY_KEY, [property, ...current]);
  },
  selectProperty(id: string) {
    if (!this.properties().some((property) => property.id === id)) return;
    write(SELECTED_PROPERTY_KEY, id);
  },
  deleteProperty(id: string) {
    const next = this.properties().filter((property) => property.id !== id);
    const selectedId = read<string>(SELECTED_PROPERTY_KEY, "");
    if (selectedId === id) {
      if (next[0]) localStorage.setItem(SELECTED_PROPERTY_KEY, next[0].id);
      else localStorage.removeItem(SELECTED_PROPERTY_KEY);
    }
    write(PROPERTY_KEY, next);
  },
  selectedProperty() {
    const properties = this.properties();
    const selectedId = read<string>(SELECTED_PROPERTY_KEY, "");
    return properties.find((property) => property.id === selectedId) || properties[0] || demoProperty;
  },
  requests: () => read<RepairRequest[]>(REQUEST_KEY, []),
  request(id: string) { return this.requests().find((item) => item.id === id); },
  saveRequest(request: RepairRequest) {
    const current = this.requests().filter((item) => item.id !== request.id);
    write(REQUEST_KEY, [request, ...current]);
  },
  deleteRequest(id: string) {
    write(REQUEST_KEY, this.requests().filter((item) => item.id !== id));
  },
};
