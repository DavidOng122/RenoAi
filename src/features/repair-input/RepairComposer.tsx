"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Camera, LoaderCircle, Mic, Video } from "lucide-react";
import { localStore } from "@/lib/local-store";
import { cn, newId } from "@/lib/utils";
import type { MediaItem } from "@/schemas/project-brief.schema";

const categories = ["Door", "Water leak", "Electrical", "Wall & ceiling", "Air-con", "Other"];

export function RepairComposer() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
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
    <div className="composer">
      <textarea aria-label="Describe the repair" placeholder="My bedroom door is scraping the floor and won't close properly..." value={description} onChange={(e) => setDescription(e.target.value)} />
      {files.length > 0 && <div className="muted" style={{fontSize:13, marginBottom:12}}>{files.length} evidence file{files.length > 1 ? "s" : ""} attached</div>}
      <div className="composer-footer">
        <div className="tool-row">
          <button className="icon-btn" aria-label="Add photos" onClick={() => fileRef.current?.click()}><Camera size={19}/></button>
          <button className="icon-btn" aria-label="Add video" onClick={() => videoRef.current?.click()}><Video size={19}/></button>
          <button className="icon-btn" aria-label="Voice input" title="Voice input coming next"><Mic size={19}/></button>
          <input ref={fileRef} hidden type="file" accept="image/*" multiple onChange={(e) => selectFiles(e.target.files)} />
          <input ref={videoRef} hidden type="file" accept="video/*" multiple onChange={(e) => selectFiles(e.target.files)} />
        </div>
        <button className="primary-btn" disabled={!description.trim() || busy} onClick={submit}>{busy ? <LoaderCircle className="spin" size={18}/> : <ArrowUp size={18}/>} {busy ? "Understanding" : "Create brief"}</button>
      </div>
    </div>
    <div className="category-section"><div className="section-label">Optional issue hint</div><div className="categories">{categories.map((item) => <button key={item} className={cn("category", category === item && "active")} onClick={() => setCategory(category === item ? undefined : item)}>{item}</button>)}</div></div>
  </>;
}
