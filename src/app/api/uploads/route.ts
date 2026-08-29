import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createRenoSupabase, EVIDENCE_BUCKET, ownerIdForEmail } from "@/server/supabase";

function extension(fileName: string, contentType: string) {
  const candidate = fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (candidate && candidate.length <= 8) return candidate;
  if (contentType.startsWith("video/")) return "mp4";
  return "jpg";
}

export const POST = auth(async function POST(request) {
  const email = request.auth?.user?.email;
  if (!email) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    const body = await request.json() as { requestId?: string; fileName?: string; contentType?: string };
    if (!body.requestId || !body.fileName || !body.contentType || !/^(image|video)\//.test(body.contentType)) {
      return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
    }
    const ownerId = ownerIdForEmail(email);
    const path = `${ownerId}/${body.requestId}/${randomUUID()}.${extension(body.fileName, body.contentType)}`;
    const supabase = createRenoSupabase(ownerId);
    const signed = await supabase.storage.from(EVIDENCE_BUCKET).createSignedUploadUrl(path);
    if (signed.error) throw signed.error;
    return NextResponse.json({ bucket: EVIDENCE_BUCKET, path, token: signed.data.token });
  } catch (error) {
    console.error("Supabase signed upload failed", error);
    return NextResponse.json({ error: "Unable to prepare upload" }, { status: 500 });
  }
});

export const PATCH = auth(async function PATCH(request) {
  const email = request.auth?.user?.email;
  if (!email) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    const body = await request.json() as { path?: string };
    const ownerId = ownerIdForEmail(email);
    if (!body.path?.startsWith(`${ownerId}/`)) return NextResponse.json({ error: "Invalid media path" }, { status: 400 });
    const supabase = createRenoSupabase(ownerId);
    const signed = await supabase.storage.from(EVIDENCE_BUCKET).createSignedUrl(body.path, 60 * 60 * 24 * 365);
    if (signed.error) throw signed.error;
    return NextResponse.json({ url: signed.data.signedUrl });
  } catch (error) {
    console.error("Supabase signed media URL failed", error);
    return NextResponse.json({ error: "Unable to load uploaded media" }, { status: 500 });
  }
});
