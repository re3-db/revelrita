import { isAdmin } from "@/lib/admin-auth";
import { parseJson, pipeline, storeConfigured } from "@/lib/redis";
import seed from "@/lib/bar/seed.json";

/**
 * Data for Helen's back bar at /recipes (public/recipes.html): her bottles, shopping list, own
 * recipes, favorites and party menu. Anyone can read it; only a logged-in admin can save.
 * Each section is one JSON value in Redis (bar:<section>). A section never saved yet reads from
 * lib/bar/seed.json, the data she built in the Claude artifact before the move.
 */

const SECTIONS = ["items", "shopping", "recipes", "prefs", "menu"] as const;
type Section = (typeof SECTIONS)[number];
const LISTS: Section[] = ["items", "shopping", "recipes"];
const key = (s: Section) => `bar:${s}`;
const MAX_BYTES = 500_000;
const fallback = seed as Record<Section, unknown>;
const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  const canEdit = await isAdmin();
  if (!storeConfigured()) return Response.json({ ...fallback, canEdit: false, stored: false }, { headers: noStore });
  try {
    const [values] = (await pipeline([["MGET", ...SECTIONS.map(key)]])) as [unknown[]];
    const data = Object.fromEntries(SECTIONS.map((s, i) => [s, parseJson(values[i]) ?? fallback[s]]));
    return Response.json({ ...data, canEdit, stored: true }, { headers: noStore });
  } catch (error) {
    console.error("Back bar read failed", error);
    return Response.json({ ...fallback, canEdit: false, stored: false }, { headers: noStore });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Log in to make changes." }, { status: 401 });
  if (!storeConfigured()) return Response.json({ error: "The database isn't connected." }, { status: 503 });
  let body: { section?: unknown; value?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send JSON." }, { status: 400 });
  }
  const section = body.section as Section;
  const value = body.value;
  if (!SECTIONS.includes(section)) return Response.json({ error: "Unknown section." }, { status: 400 });
  const shapeOk = LISTS.includes(section) ? Array.isArray(value) : Boolean(value) && typeof value === "object" && !Array.isArray(value);
  if (!shapeOk) return Response.json({ error: "That isn't the right shape for " + section + "." }, { status: 400 });
  const raw = JSON.stringify(value);
  if (raw.length > MAX_BYTES) return Response.json({ error: "Too big to save." }, { status: 413 });
  try {
    await pipeline([["SET", key(section), raw]]);
  } catch (error) {
    console.error("Back bar save failed", error);
    return Response.json({ error: "The database didn't answer. Try again." }, { status: 502 });
  }
  return Response.json({ ok: true }, { headers: noStore });
}
