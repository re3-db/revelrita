import { CUSTOM_MENU, guestCount, standardAddOns } from "@/lib/addons";
import { hoursBetween, timeRange } from "@/lib/dates";
import { drinkLabels, mockMenu, monthIn } from "@/lib/menu";
import { reviewsBy } from "@/lib/reviews";
import { contact } from "@/lib/site";

/**
 * A proposal Helen sends a client: the same fields as her proposal builder artifact
 * ("Revelrita proposal builder"), now stored on the site instead of inside a link.
 * Multi-line fields keep the artifact's formats ("one per line", "title | sentence").
 * Shared by the admin builder (client) and the server, so nothing server-only here.
 */
export type ProposalContent = {
  /** "Who it's for": the hero says "Hey, <name>." */
  name: string;
  /** Sets the accent color (wedding is peach, the rest orange) and "Hi" vs "Hey" */
  eventType: EventType;
  occasion: string;
  date: string;
  /** "5:00 to 9:00 PM" */
  time: string;
  venue: string;
  guests: string;
  serviceWindow: string;
  /** The opening note under the greeting */
  intro: string;
  packageName: string;
  /** One per line */
  included: string;
  /** The opening statement slide (skipped when both are empty) */
  visionTitle: string;
  visionBody: string;
  /** "What makes Revelrita different": "title | sentence" per line, first four shown */
  different: string;
  /** "question | answer" per line */
  faq: string;
  /** Client quote (slide skipped when empty) */
  quote: string;
  quoteBy: string;
  /** Which photos appear, see `photoKeys` */
  photos: PhotoKey[];
  menuTitle: string;
  /** "name | ingredients" per line; "# Group" starts a group, a name alone joins a dotted line */
  menu: string;
  pricing: PriceLine[];
  /** What the client can tick on the "Make it yours" slide (skipped when empty), see lib/addons.ts */
  addOns: PriceLine[];
  deposit: string;
  holdsFor: string;
  peak: string;
  /** "What's in the number": "title | sentence" per line */
  inTheNumber: string;
  pricingNote: string;
  alcohol: string;
  /** One per line */
  steps: string;
  email: string;
  phone: string;
  signOff: string;
};

export type PriceLine = { label: string; amount: string; note: string };

export const eventTypes = [
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate" },
  { value: "private", label: "Private party" },
  { value: "popup", label: "Pop-up or activation" },
] as const;
export type EventType = (typeof eventTypes)[number]["value"];

/** The builder's photo checkboxes, in the artifact's order. */
export const photoKeys = ["cart", "counter", "bar", "drinks", "toast", "bartender", "helen", "guest", "bottles"] as const;
export type PhotoKey = (typeof photoKeys)[number];

export const photoLabels: Record<PhotoKey, string> = {
  cart: "The cart, wide shot (top of the page)",
  counter: "Counter with flowers and menu",
  bar: "Bar top with wine at dusk",
  drinks: "Margaritas with dried lime (above the menu)",
  toast: "Guests toasting (by the menu)",
  bartender: "Guests lined up at the cart",
  helen: "You with the cart (testimonial slide)",
  guest: "Guest laughing at dusk (what's next)",
  bottles: "Bottles on the bar (the numbers)",
};

export type ProposalStatus = "draft" | "sent";

export type Proposal = {
  id: string;
  status: ProposalStatus;
  createdAt: number;
  updatedAt: number;
  /** Where "Send" emails it. Comes from the inquiry form, editable in the builder. */
  clientEmail: string;
  sentAt?: number;
  sentTo?: string;
  /** The inquiry form answers this draft was made from, shown in the builder for reference */
  inquiry?: { answers: [question: string, answer: string][]; receivedAt: number };
  content: ProposalContent;
  /** The add-ons the client ticked and sent from their page (labels from content.addOns) */
  picks?: { labels: string[]; at: number };
};

/* ---------- the artifact's standard wording ---------- */

export const DEFAULT_ALCOHOL =
  "Due to CA liquor licensing laws, alcohol has to be purchased under your name, not mine. To make it as easy as possible, here's what we do:\n\nI build the full shopping list down to the bottle, then place and manage the Total Wine order. You either pay at checkout with your card, or log into my Total Wine account and pay there. Anything unopened goes home with you!\n\nThat means two separate payments: the alcohol, paid directly by you, and my service invoice for everything above.";

/** The quote every proposal starts with: the whole experience, from booking to cleanup, in one review */
const [standardQuote] = reviewsBy("Grace Kelly");

export function defaultContent(): ProposalContent {
  return {
    name: "",
    eventType: "wedding",
    occasion: "",
    date: "",
    time: "",
    venue: "",
    guests: "",
    serviceWindow: "",
    intro: "We can't wait to make your party memorable!",
    packageName: "",
    included: [
      "The bar cart, styled and ready to go",
      "Two bartenders for the full service window",
      "Drinkware",
      "Ice",
      "Fresh citrus, herbs and garnishes",
      "Mixers, juices and everything non-alcoholic",
      // Every package but beer and wine (contentFromInquiry takes it out for those)
      CUSTOM_MENU,
      "Setup and pack-out, we leave it cleaner than we found it",
      "Your shopping list, built and managed by me",
      "Coordination with your planner or venue",
    ].join("\n"),
    visionTitle: "It started with 600 cocktails.",
    visionBody:
      "Thanks for thinking of Revelrita for your party! The idea started at my own wedding, where I made all 600 drinks myself and learned that craft cocktails at scale are both doable and delicious, and they keep everyone out of a never ending line at the bar.\n\nSo now I do it for other people's parties. Craft cocktails, beer and wine, mocktails only, it doesn't matter. Every guest gets a drink that's delicious.",
    different: [
      "It's a real miniature horse trailer | Restored and painted sky blue, with a live-edge wood bar. It's hard to get cuter than that!",
      "You pay liquor store prices | I build the shopping list, you pay at checkout. No markup, and unopened bottles go home with you.",
      "Craft cocktails, for real | Cucumber vodka infused overnight. A charcoal margarita. A drink named after the birthday boy. Real juice, the right ice, whatever you dream up.",
      "Electric staff | Fun, personable bartenders who are there to make your night great.",
    ].join("\n"),
    faq: [
      "How much space do you need? | The cart is 67 inches wide and 143 inches long, about 5.5 by 12 feet, and needs a level spot to park with a little room for people to gather. If that won't fit, we bring a smaller bar that will.",
      "How early do you arrive? | Early enough to park, set up and style the bar, and be pouring the minute your bar opens. Usually about ninety minutes ahead.",
      "How far do you travel? | We're based in Cardiff and cover San Diego County. Farther than that is usually still a yes, it just adds a travel fee.",
      "What if we don't want hard liquor? | Beer and wine only, mocktails only, any combination. The care that goes into the drinks doesn't change.",
    ].join("\n"),
    quote: standardQuote.quote,
    quoteBy: `${standardQuote.name}, Google review`,
    photos: [...photoKeys],
    menuTitle: "",
    menu: "",
    pricing: [],
    addOns: standardAddOns(),
    deposit: "",
    holdsFor: "",
    peak: "",
    inTheNumber: [
      "Fresh juice and real citrus | The good stuff costs more than sour mix, and you can taste the difference.",
      "A prep day before your event | Shopping, batching, ice pickup. Everything ready before we pull up.",
      "Bartenders who are actually good | Paid properly, which is why they're fun.",
      "The cart, setup and pack-out |",
      "The alcohol is separate, and you buy it at store prices | So the total usually lands under what a catered bar charges for the same night.",
    ].join("\n"),
    pricingNote: "",
    alcohol: DEFAULT_ALCOHOL,
    steps: [
      "Say the word and I'll send the invoice and the agreement",
      "The deposit holds your date",
      "We lock the menu, then I build your shopping list",
      "I show up early, set up, and you go be a guest at your own party",
    ].join("\n"),
    email: contact.email,
    phone: contact.phone,
    signOff: "Can't wait. Let's make it a party!",
  };
}

/* ---------- pricing ---------- */

export const money = (n: number) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });

/**
 * The pricing lines as the client's page shows them (the artifact's rules): amounts that are
 * numbers get formatted and added up, anything else ("Included", "TBD") shows as typed, and a
 * blank one shows `blank`. Add-ons use the same rules, with no "TBD".
 */
export function pricedRows(pricing: PriceLine[], blank = "TBD") {
  const rows = pricing
    .map((row) => {
      const r = { label: row.label.trim(), amount: row.amount.trim(), note: row.note.trim() };
      // "Bar cart, 4 hours: $850" typed all in the first box still counts as an amount
      if (!r.amount) {
        const m = r.label.match(/[:\-\u2013]?\s*\$?\s*([0-9][0-9,]*(?:\.[0-9]{2})?)\s*\$?\s*$/);
        if (m) {
          r.amount = m[1];
          r.label = r.label
            .slice(0, m.index)
            .replace(/[\s:,\-]+$/, "")
            .trim();
        }
      }
      const raw = r.amount.replace(/[$,\s]/g, "");
      const num = raw !== "" && /^[0-9.]+$/.test(raw) ? parseFloat(raw) : null;
      return { ...r, num, display: num !== null ? money(num) : r.amount || blank };
    })
    .filter((r) => r.label || r.amount);
  const counted = rows.filter((r) => r.num !== null);
  const total = counted.reduce((sum, r) => sum + (r.num ?? 0), 0);
  return { rows, counted, total };
}

/* ---------- every section, every time ---------- */

/**
 * Every proposal shows every section. One missing its quote, its menu or a price line (made
 * before those were standard, or started by hand) gets the standard one when it's opened:
 * Grace Kelly's quote, a mock-up menu from their inquiry (or the event type and date), and a
 * "Bar cart and two bartenders" line for Helen to price. A blank time takes the one from their
 * inquiry, if they gave one (the proposal shows "TBD" otherwise). Clearing one brings it back.
 */
export function withAllSections(content: ProposalContent, inquiry?: Proposal["inquiry"]): ProposalContent {
  const c = { ...content };
  const said = (question: string) => inquiry?.answers.find(([q]) => q === question)?.[1] ?? "";
  if (!c.time.trim()) c.time = said("Event time");
  if (!c.quote.trim()) {
    c.quote = standardQuote.quote;
    c.quoteBy = c.quoteBy.trim() || `${standardQuote.name}, Google review`;
  }
  if (!c.menu.trim()) {
    const drinksLabel = said("What are you thinking for drinks?");
    const menu = mockMenu({
      drinks: Object.keys(drinkLabels).find((k) => drinkLabels[k] === drinksLabel) ?? "",
      kind: [said("What kind of event is it?"), c.occasion, eventTypes.find((t) => t.value === c.eventType)?.label ?? ""].join(" "),
      vibe: [said("Where is it, and what's the vibe?"), c.venue].join(" "),
      month: monthIn(c.date) ?? monthIn(said("Event date")),
    });
    c.menu = menu.menu;
    c.menuTitle = c.menuTitle.trim() || menu.menuTitle;
  }
  if (!c.pricing.some((r) => r.label.trim() || r.amount.trim())) {
    const hours = c.serviceWindow.trim();
    c.pricing = [{ label: `Bar cart and two bartenders${hours ? `, ${hours}` : ""}`, amount: "", note: "" }];
  }
  return c;
}

/* ---------- untrusted input (server actions) ---------- */

const text = (value: unknown, max = 5000) => (typeof value === "string" ? value.slice(0, max) : "");

/** Coerces whatever the builder posted into a well-formed ProposalContent. */
export function normalizeContent(input: unknown): ProposalContent {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const base = defaultContent();
  const out = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(base) as (keyof ProposalContent)[]) {
    if (key === "photos" || key === "pricing" || key === "addOns" || key === "eventType") continue;
    out[key] = text(raw[key]);
  }
  const type = eventTypes.find((t) => t.value === raw.eventType);
  out.eventType = type ? type.value : base.eventType;
  const photos: unknown[] = Array.isArray(raw.photos) ? raw.photos : [];
  out.photos = photoKeys.filter((k) => photos.includes(k));
  const priceLines = (value: unknown): PriceLine[] =>
    Array.isArray(value)
      ? value.slice(0, 30).map((row) => {
          const r = (row && typeof row === "object" ? row : {}) as Record<string, unknown>;
          return { label: text(r.label, 300), amount: text(r.amount, 100), note: text(r.note, 300) };
        })
      : [];
  out.pricing = priceLines(raw.pricing);
  // Proposals made before add-ons existed get none (not the standard list): the ones already
  // sent would otherwise change in front of the client. The builder can add the standard list.
  out.addOns = priceLines(raw.addOns);
  return out as ProposalContent;
}

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/* ---------- inquiry form to draft ---------- */

export type InquiryDetails = {
  name: string;
  email: string;
  /** One per picked day, YYYY-MM-DD (anything else is used as typed) */
  dates: string[];
  /** The visitor is still choosing between the dates */
  flexible: boolean;
  guests: string;
  kind: string;
  /** The form's drinks choice (beer-wine, beer-wine-cocktails, mocktails, unsure) */
  drinks: string;
  /** HH:MM from the form's time inputs, or blank */
  start: string;
  end: string;
  vibe: string;
};

/** "Saturday, June 13, 2027" for a YYYY-MM-DD date, without time zone shifts. */
export function longDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Best guess at the event type from what they typed, for the colors and greeting. */
export function guessEventType(...answers: string[]): EventType {
  const said = answers.join(" ").toLowerCase();
  if (/wedding|bridal|bride|engage|rehearsal|elop|vow/.test(said)) return "wedding";
  if (/corporate|company|work|office|team|client|employee|conference|offsite|holiday party/.test(said)) return "corporate";
  if (/pop-?up|activation|brand|launch|market|festival|grand opening/.test(said)) return "popup";
  if (/birthday|bday|party|shower|anniversary|graduat|retire|backyard|celebrat|reunion|baby/.test(said)) return "private";
  return "wedding";
}

/**
 * A draft proposal for a new inquiry: the builder's defaults, plus everything the form told us,
 * and a mock-up menu built from their drinks choice, date and vibe (lib/menu.ts).
 */
export function contentFromInquiry(inquiry: InquiryDetails): ProposalContent {
  const content = defaultContent();
  const firstName = inquiry.name.split(/\s+/)[0] ?? "";
  const kind = inquiry.kind.trim();
  const guests = inquiry.guests.trim();
  const dates = inquiry.dates.map((d) => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? longDate(d) : d));

  content.name = firstName;
  content.eventType = guessEventType(kind, inquiry.vibe);
  content.occasion = kind ? kind.charAt(0).toUpperCase() + kind.slice(1) : "";
  content.date = inquiry.flexible ? (dates.length ? dates.join(" or ") : "") : (dates[0] ?? "");
  content.guests = /^\d[\d,]*$/.test(guests) ? `${guests} guests` : guests;
  content.time = timeRange(inquiry.start, inquiry.end);
  content.serviceWindow = hoursBetween(inquiry.start, inquiry.end);
  // Cocktail and mocktail packages come with a custom menu sign; beer and wine can add one
  const menuIncluded = inquiry.drinks !== "beer-wine";
  if (!menuIncluded) {
    content.included = content.included
      .split("\n")
      .filter((l) => l.trim() !== CUSTOM_MENU)
      .join("\n");
  }
  content.addOns = standardAddOns({ guests: guestCount(guests), menuIncluded });
  Object.assign(content, mockMenu({ drinks: inquiry.drinks, kind, vibe: inquiry.vibe, date: inquiry.dates[0] }));
  return content;
}

/* ---------- sending ---------- */

export function defaultSubject(content: ProposalContent) {
  return `Your Revelrita proposal${content.date.trim() ? ` for ${content.date.trim()}` : ""}`;
}

export function defaultMessage(content: ProposalContent) {
  return [
    `Hi ${content.name.trim() || "there"},`,
    "Thank you so much for thinking of Revelrita! I put together a proposal with everything in one place: what's included, the drinks and the numbers.",
    "Have a look and let me know what you think. Happy to change anything.",
    "Cheers,\nHelen",
  ].join("\n\n");
}
