"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrickWall, DoorClosed, Droplet, Grid2X2, LoaderCircle, Mic, Plus, Zap } from "lucide-react";
import { localStore } from "@/lib/local-store";
import { cn, newId } from "@/lib/utils";
import type { MediaItem } from "@/schemas/project-brief.schema";

const categories = [
  { label: "Water", sub: "Leak", icon: Droplet, tint: "#3b82f6" },
  { label: "Electrical", sub: "Power issue", icon: Zap, tint: "#f59e0b" },
  { label: "Door / Cabinet", sub: "Woodwork", icon: DoorClosed, tint: "#1e2939" },
  { label: "Wall / Ceiling", sub: "Crack, stain", icon: BrickWall, tint: "#0f766e" },
  { label: "Tiles / Floor", sub: "Tiles, floor", icon: Grid2X2, tint: "#6b7280" },
];

export function RepairComposer() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  function selectFiles(list: FileList | null) { if (list) setFiles((old) => [...old, ...Array.from(list)]); }

  async function imageDataUrl(file: File) {
    const raw = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
    const image = await new Promise<HTMLImageElement>((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = raw; });
    const scale = Math.min(1, 1280 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas"); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", .76);
  }

  async function submit() {
    if (!description.trim() || busy) return;
    setBusy(true);
    const id = newId("request");
    const evidence = files.reduce<{ photos: MediaItem[]; videos: MediaItem[] }>((acc, file, index) => {
      const item: MediaItem = { id: `${id}_media_${index}`, type: file.type.startsWith("video") ? "video" : "photo", storage_url: URL.createObjectURL(file) };
      acc[item.type === "photo" ? "photos" : "videos"].push(item); return acc;
    }, { photos: [], videos: [] });
    localStore.saveRequest({ id, property_id: localStore.selectedProperty().id, description: description.trim(), category_hint: category, status: "collecting_info", created_at: new Date().toISOString(), evidence });
    try {
      const image_data_urls = await Promise.all(files.filter((file) => file.type.startsWith("image")).slice(0, 4).map(imageDataUrl));
      const response = await fetch("/api/problem-brief", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ request_id: id, property: localStore.selectedProperty(), description: description.trim(), category_hint: category, image_data_urls }) });
      if (!response.ok) throw new Error("Analysis failed");
      const analysis = await response.json();
      const request = localStore.request(id)!;
      request.analysis = analysis;
      request.status = analysis.is_complete ? "review" : "collecting_info";
      localStore.saveRequest(request);
      router.push(analysis.is_complete ? `/repair/${id}/review` : `/repair/${id}/clarify`);
    } catch {
      setBusy(false);
      alert("We couldn't prepare the brief. Please try again.");
    }
  }

  return <>
    <div className="composer-card">
      <div className="composer-photos">
        <button className="composer-add" aria-label="Add photos" onClick={() => fileRef.current?.click()}><Plus size={25}/><span>Add</span></button>
        {files.filter((f) => f.type.startsWith("image")).map((file, i) => <img className="composer-thumb" key={i} src={URL.createObjectURL(file)} alt=""/>)}
        <input ref={fileRef} hidden type="file" accept="image/*" multiple onChange={(e) => selectFiles(e.target.files)} />
      </div>
      <textarea className="composer-textarea" aria-label="Describe the repair" placeholder="My bedroom door is scraping the floor and won't close properly..." value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="composer-toolbar">
        <button className="composer-icon-btn" aria-label="Add attachment" onClick={() => fileRef.current?.click()}><Plus size={18}/></button>
        <button className="composer-mic-btn" disabled={!description.trim() || busy} onClick={submit} aria-label="Create brief">{busy ? <LoaderCircle className="spin" size={17}/> : <Mic size={17}/>}</button>
      </div>
    </div>
    <div className="issue-section">
      <div className="issue-label">Choose likely issue</div>
      <div className="issue-row">
        {categories.map(({ label, sub, icon: Icon, tint }) => (
          <button key={label} className={cn("issue-chip", category === label && "active")} onClick={() => setCategory(category === label ? undefined : label)}>
            <Icon size={22} color={tint} strokeWidth={1.75}/>
            <div><p className="issue-chip-title">{label}</p><p className="issue-chip-sub">{sub}</p></div>
          </button>
        ))}
      </div>
    </div>
  </>;
}
