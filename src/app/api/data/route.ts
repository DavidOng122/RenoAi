import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PropertySchema } from "@/schemas/property.schema";
import { createRenoSupabase, EVIDENCE_BUCKET, ownerIdForEmail } from "@/server/supabase";

type StoredMedia = { storage_path?: string };
type StoredRequest = { id: string; evidence?: { photos?: StoredMedia[]; videos?: StoredMedia[] } };

function ownerFor(request: { auth?: { user?: { email?: string | null } } | null }) {
  const email = request.auth?.user?.email;
  if (!email) return null;
  return ownerIdForEmail(email);
}

export const GET = auth(async function GET(request) {
  const ownerId = ownerFor(request);
  if (!ownerId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    const supabase = createRenoSupabase(ownerId);
    const [properties, requests] = await Promise.all([
      supabase.from("reno_properties").select("data,updated_at").eq("owner_id", ownerId).order("updated_at", { ascending: false }),
      supabase.from("reno_requests").select("data,updated_at").eq("owner_id", ownerId).order("updated_at", { ascending: false }),
    ]);
    if (properties.error) throw properties.error;
    if (requests.error) throw requests.error;
    return NextResponse.json({
      properties: (properties.data || []).map((row) => row.data),
      requests: (requests.data || []).map((row) => row.data),
    });
  } catch (error) {
    console.error("Supabase sync read failed", error);
    return NextResponse.json({ error: "Unable to load saved data" }, { status: 500 });
  }
});

export const POST = auth(async function POST(request) {
  const ownerId = ownerFor(request);
  if (!ownerId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    const body = await request.json() as { kind?: "property" | "request"; data?: unknown };
    const supabase = createRenoSupabase(ownerId);
    if (body.kind === "property") {
      const property = PropertySchema.parse(body.data);
      const { error } = await supabase.from("reno_properties").upsert(
        { owner_id: ownerId, id: property.id, data: property, updated_at: new Date().toISOString() },
        { onConflict: "owner_id,id" },
      );
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    const savedRequest = body.data as StoredRequest | undefined;
    if (body.kind !== "request" || !savedRequest?.id) {
      return NextResponse.json({ error: "Invalid saved record" }, { status: 400 });
    }
    const { error } = await supabase.from("reno_requests").upsert(
      { owner_id: ownerId, id: savedRequest.id, data: savedRequest, updated_at: new Date().toISOString() },
      { onConflict: "owner_id,id" },
    );
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Supabase sync write failed", error);
    return NextResponse.json({ error: "Unable to save data" }, { status: 500 });
  }
});

export const DELETE = auth(async function DELETE(request) {
  const ownerId = ownerFor(request);
  if (!ownerId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    const body = await request.json() as { kind?: "property" | "request"; id?: string };
    if (!body.id || !body.kind) return NextResponse.json({ error: "Invalid delete request" }, { status: 400 });
    const supabase = createRenoSupabase(ownerId);

    if (body.kind === "request") {
      const existing = await supabase.from("reno_requests").select("data").eq("owner_id", ownerId).eq("id", body.id).maybeSingle();
      if (existing.error) throw existing.error;
      const record = existing.data?.data as StoredRequest | undefined;
      const paths = [...(record?.evidence?.photos || []), ...(record?.evidence?.videos || [])]
        .map((media) => media.storage_path)
        .filter((path): path is string => Boolean(path));
      if (paths.length) {
        const removed = await supabase.storage.from(EVIDENCE_BUCKET).remove(paths);
        if (removed.error) console.error("Supabase evidence cleanup failed", removed.error);
      }
    }

    const table = body.kind === "property" ? "reno_properties" : "reno_requests";
    const deleted = await supabase.from(table).delete().eq("owner_id", ownerId).eq("id", body.id);
    if (deleted.error) throw deleted.error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Supabase delete failed", error);
    return NextResponse.json({ error: "Unable to delete data" }, { status: 500 });
  }
});
