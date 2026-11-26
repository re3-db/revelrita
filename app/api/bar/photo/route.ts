import type { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { parseJson, pipeline, storeConfigured } from "@/lib/redis";

/**
 * Drink photos for the back bar (/recipes). One per drink id, stored as base64 at
 * bar:photo:<id>, with bar:photos (a hash of id -> version) listing which drinks have one.
 * The page shrinks photos to about 1200px before sending, so each is a couple hundred KB.
 * Anyone can view; adding or removing needs the admin login.
 */

const ID = /^[a-z0-9][a-z0-9-]{0,99}$/;
const DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;
const MAX_CHARS = 900_000;

type Photo = { type: string; data: string };

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!ID.test(id) || !storeConfigured()) return new Response("Not found", { status: 404 });
  const [raw] = await pipeline([["GET", `bar:photo:${id}`]]);
  const photo = parseJson<Photo>(raw);
  if (!photo) return new Response("Not found", { status: 404 });
  // The page asks for ?v=<version>, so a replaced photo gets a new URL and this can cache for good
  return new Response(Buffer.from(photo.data, "base64"), {
    headers: { "Content-Type": photo.type, "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable" },
  });
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Log in to add photos." }, { status: 401 });
  if (!storeConfigured()) return Response.json({ error: "The database isn't connected." }, { status: 503 });
  let body: { id?: unknown; dataUrl?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send JSON." }, { status: 400 });
  }
  const id = String(body.id ?? "");
  const match = DATA_URL.exec(String(body.dataUrl ?? ""));
  if (!ID.test(id) || !match) return Response.json({ error: "That photo couldn't be read." }, { status: 400 });
  if (match[2].length > MAX_CHARS) return Response.json({ error: "That photo is too big. Try a smaller one." }, { status: 413 });
  const v = Date.now();
  try {
    await pipeline([
      ["SET", `bar:photo:${id}`, JSON.stringify({ type: match[1], data: match[2] } satisfies Photo)],
      ["HSET", "bar:photos", id, v],
    ]);
  } catch (error) {
    console.error("Back bar photo save failed", error);
    return Response.json({ error: "The photo didn't save. Try again." }, { status: 502 });
  }
  return Response.json({ v });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Log in to remove photos." }, { status: 401 });
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!ID.test(id) || !storeConfigured()) return Response.json({ error: "Unknown photo." }, { status: 400 });
  await pipeline([["DEL", `bar:photo:${id}`], ["HDEL", "bar:photos", id]]);
  return Response.json({ ok: true });
}
