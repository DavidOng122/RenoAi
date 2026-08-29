"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, BrickWall, DoorClosed, Droplet, Grid2X2, LoaderCircle, Mic, Plus, Square, Video, X, Zap } from "lucide-react";
import { localStore } from "@/lib/local-store";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { cn, newId } from "@/lib/utils";
import type { MediaItem } from "@/schemas/project-brief.schema";

type SpeechResult = {
  isFinal: boolean;
  0: { transcript: string };
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<SpeechResult> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

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
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voiceStartTextRef = useRef("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  function selectFiles(list: FileList | null) { if (list) setFiles((old) => [...old, ...Array.from(list)]); }

  async function imageDataUrl(file: File) {
    const raw = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
    const image = await new Promise<HTMLImageElement>((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = raw; });
    const scale = Math.min(1, 1280 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas"); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", .76);
  }

  async function uploadEvidence(requestId: string, file: File, index: number): Promise<MediaItem> {
    const prepared = await fetch("/api/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, fileName: file.name, contentType: file.type }),
    });
    if (!prepared.ok) throw new Error("Unable to prepare upload");
    const upload = await prepared.json() as { bucket: string; path: string; token: string };
    const { error } = await getSupabaseBrowser().storage
      .from(upload.bucket)
      .uploadToSignedUrl(upload.path, upload.token, file, { contentType: file.type, cacheControl: "3600" });
    if (error) throw error;

    const signed = await fetch("/api/uploads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: upload.path }),
    });
    if (!signed.ok) throw new Error("Unable to create media URL");
    const { url } = await signed.json() as { url: string };
    return {
      id: `${requestId}_media_${index}`,
      type: file.type.startsWith("video") ? "video" : "photo",
      storage_url: url,
      storage_path: upload.path,
    };
  }

  async function submit() {
    if (!description.trim() || busy) return;
    setBusy(true);
    const id = newId("request");
    try {
      const oversized = files.find((file) => file.size > 25 * 1024 * 1024);
      if (oversized) throw new Error(`${oversized.name} is larger than 25 MB`);
      const [uploadedMedia, image_data_urls] = await Promise.all([
        Promise.all(files.map((file, index) => uploadEvidence(id, file, index))),
        Promise.all(files.filter((file) => file.type.startsWith("image")).slice(0, 4).map(imageDataUrl)),
      ]);
      const evidence = uploadedMedia.reduce<{ photos: MediaItem[]; videos: MediaItem[] }>((acc, item) => {
        acc[item.type === "photo" ? "photos" : "videos"].push(item);
        return acc;
      }, { photos: [], videos: [] });
      sessionStorage.setItem(`renoai.analysis-images.${id}`, JSON.stringify(image_data_urls));
      localStore.saveRequest({ id, property_id: localStore.selectedProperty().id, description: description.trim(), category_hint: category, status: "analysing", created_at: new Date().toISOString(), evidence });
      router.push(`/repair/${id}/processing`);
    } catch (error) {
      setBusy(false);
      alert(error instanceof Error ? error.message : "We couldn't upload the evidence. Please try again.");
    }
  }

  function startVoiceInput() {
    const speechWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      alert("Voice input isn't supported in this browser. Try Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new Recognition();
    voiceStartTextRef.current = description.trim();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-SG";
    recognition.onresult = (event) => {
      const spokenText = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      setDescription([voiceStartTextRef.current, spokenText].filter(Boolean).join(" "));
    };
    recognition.onerror = (event) => {
      setListening(false);
      recognitionRef.current = null;
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        alert("Microphone access is blocked. Allow microphone permission and try again.");
      } else if (event.error !== "aborted" && event.error !== "no-speech") {
        alert("Voice input stopped unexpectedly. Please try again.");
      }
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
    } catch {
      alert("Voice input couldn't start. Please try again.");
    }
  }

  function handlePrimaryAction() {
    if (busy) return;
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    if (description.trim()) {
      void submit();
      return;
    }
    startVoiceInput();
  }

  return (
    <>
      <section className="composer-card">
        <div className="composer-photos">
          <button className="composer-add" type="button" aria-label="Add photos or video" onClick={() => fileRef.current?.click()}>
            <Plus size={25} strokeWidth={1.7} />
            <span>Add</span>
          </button>
          {files.map((file, index) => file.type.startsWith("image")
            ? <img className="composer-thumb" key={`${file.name}-${index}`} src={URL.createObjectURL(file)} alt="Selected repair evidence" />
            : <div className="composer-video" key={`${file.name}-${index}`}><Video aria-hidden size={22} /><span>Video</span></div>)}
          <input ref={fileRef} hidden type="file" accept="image/*,video/*" multiple onChange={(e) => selectFiles(e.target.files)} />
        </div>
        {category && (
          <div className="composer-selected-issue" role="status">
            <span>{category}</span>
            <button type="button" aria-label={`Remove ${category} issue type`} onClick={() => setCategory(undefined)}><X size={14} strokeWidth={1.8} /></button>
          </div>
        )}
        <textarea className="composer-textarea" aria-label="Describe the repair" placeholder="My bedroom door is scraping the floor and won't close properly..." value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="composer-toolbar">
          <button className="composer-icon-btn" type="button" aria-label="Add attachment" onClick={() => fileRef.current?.click()}><Plus size={18} /></button>
          <div className="composer-voice-action">
            {listening && <span className="composer-listening-copy" role="status">Listening…</span>}
            <button
              className={cn("composer-mic-btn", listening && "listening")}
              type="button"
              disabled={busy}
              onClick={handlePrimaryAction}
              aria-label={listening ? "Stop voice input" : description.trim() ? "Send repair description" : "Start voice input"}
            >
              {busy
                ? <LoaderCircle className="spin" size={17} />
                : listening
                  ? <Square size={12} fill="currentColor" />
                  : description.trim()
                    ? <ArrowUp size={18} strokeWidth={2} />
                    : <Mic size={17} />}
            </button>
          </div>
        </div>
      </section>
      <section className="issue-section" aria-label="Choose likely issue">
        <div className="issue-label">Choose likely issue</div>
        <div className="issue-row">
          {categories.map(({ label, sub, icon: Icon, tint }) => (
            <button type="button" key={label} aria-pressed={category === label} className={cn("issue-chip", category === label && "active")} onClick={() => setCategory(category === label ? undefined : label)}>
              <Icon aria-hidden size={22} color={tint} strokeWidth={1.75} />
              <span><strong>{label}</strong><small>{sub}</small></span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
