/**
 * The mock-up menu on a draft proposal, built from what the client sent through the form. The
 * occasion picks a theme: the menu's title and the drink names ("Make-a-Wish Watermelon Marg",
 * "Naughty List Old Fashioned"). The season of their date picks the flavors. Their drinks choice
 * sets the shape: Helen's three signatures (a seasonal marg, a bourbon drink and the Stoli Olli)
 * with a zero-proof drink, beer and wine; or beer and wine with a zero-proof drink; or three
 * zero-proof drinks. Same inquiry, same menu (no randomness, no AI). The proposal labels it
 * "Mock up menu (subject to change!)", and Helen edits it like any other field.
 */

/** The form's drinks choices, as they read in the emails and on a draft's "What they sent" */
export const drinkLabels: Record<string, string> = {
  "beer-wine": "Beer and wine",
  "beer-wine-cocktails": "Beer, wine and cocktails",
  mocktails: "Mocktails only",
  unsure: "No idea, help me decide!",
};

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** The month (1-12) named in text like "Saturday, June 13, 2027" or "Sat, Jun 13", or null */
export function monthIn(text: string) {
  const m = text.toLowerCase().match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/);
  return m ? MONTHS.indexOf(m[1]) + 1 : null;
}

/** The Revelrita classic, on every cocktail menu */
export const STOLI = "The Stoli Olli";
const STOLI_LINE = `${STOLI} | Our classic: vodka soaked with fresh pineapple for two weeks, served ice cold`;

/* ---------- the season: flavors ---------- */

type Season = "winter" | "spring" | "summer" | "fall" | "any";

function seasonOf(month: number | null): Season {
  if (!month) return "any";
  if (month === 12 || month <= 2) return "winter";
  if (month <= 5) return "spring";
  if (month <= 9) return "summer";
  return "fall";
}

const flavors: Record<
  Season,
  { fruit: string; marg: string; bourbon: "Smash" | "Old Fashioned"; bourbonIng: string; zero: string; zeroIng: string }
> = {
  winter: {
    fruit: "Blood Orange",
    marg: "tequila blanco, blood orange, lime, agave, salt rim",
    bourbon: "Old Fashioned",
    bourbonIng: "bourbon, maple, orange bitters, orange peel",
    zero: "Mule",
    zeroIng: "cranberry, ginger beer, lime, rosemary",
  },
  spring: {
    fruit: "Strawberry",
    marg: "tequila blanco, strawberry, basil, lime, agave",
    bourbon: "Smash",
    bourbonIng: "bourbon, honey, lemon, fresh mint",
    zero: "Lemonade",
    zeroIng: "hibiscus, lemon, agave, soda",
  },
  summer: {
    fruit: "Watermelon",
    marg: "tequila blanco, watermelon, lime, agave, tajín rim",
    bourbon: "Smash",
    bourbonIng: "bourbon, muddled peach, lemon, fresh mint",
    zero: "Cooler",
    zeroIng: "watermelon, mint, lime, soda",
  },
  fall: {
    fruit: "Spiced Pear",
    marg: "tequila reposado, pear, cinnamon, lime, agave",
    bourbon: "Smash",
    bourbonIng: "bourbon, apple cider, cinnamon, lemon",
    zero: "Spritz",
    zeroIng: "apple cider, cinnamon, lemon, soda",
  },
  any: {
    fruit: "Passion Fruit",
    marg: "tequila blanco, passion fruit, lime, agave",
    bourbon: "Smash",
    bourbonIng: "bourbon, lemon, fresh mint, simple syrup",
    zero: "Spritz",
    zeroIng: "passion fruit, lime, agave, soda",
  },
};

/* ---------- the occasion: the title and the drink names ---------- */

type Party = { name: string; age: number | null; years: number | null; year: number | null; season: Season };

type Theme = {
  /** The menu's title */
  title: (p: Party) => string;
  /** "Make-a-Wish" + " Watermelon Marg" */
  marg: string;
  /** "Tie the Knot" + " Smash" / " Old Fashioned" */
  bourbon: string;
  /** In winter, when "<bourbon> Old Fashioned" doesn't read well */
  oldFashioned?: string;
  /** "Party Favor" + " Cooler" */
  zero: string;
};

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
const inWords = (n: number) => (n < 20 ? ONES[n] : n < 100 ? TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : "") : String(n));

const seasonTitles: Record<Season, string> = {
  winter: "Cozy Season Pours",
  spring: "Spring Fling Sips",
  summer: "Summer Sippin'",
  fall: "Fall Into Fun",
  any: "The Party Bar",
};

const themes = {
  birthday: {
    title: ({ name, age }) => {
      const special: Record<number, string> = { 21: "Twenty-One & Fun", 30: "Dirty Thirty", 40: "Forty & Fabulous", 50: "Fifty & Fabulous" };
      if (age && special[age]) return name ? `${name}'s ${special[age]}` : special[age];
      if (age) return name ? `${name} Turns ${inWords(age)}` : `The Big ${inWords(age)}`;
      return name ? `${name}'s Birthday Bar` : "The Birthday Bar";
    },
    marg: "Make-a-Wish",
    bourbon: "Older & Wiser",
    oldFashioned: "The Older Fashioned",
    zero: "Party Favor",
  },
  wedding: { title: () => "Happily Ever After Hours", marg: "Just Married", bourbon: "Tie the Knot", zero: "Something Borrowed" },
  rehearsal: { title: () => "The Night Before", marg: "Almost Married", bourbon: "Tie the Knot", zero: "Something Borrowed" },
  engagement: { title: () => "Put a Ring on It", marg: "Said Yes", bourbon: "Ring Bling", zero: "Happily Engaged" },
  bachelorette: { title: () => "Last Fling Before the Ring", marg: "Bride Tribe", bourbon: "Last Fling", zero: "Maid of Honor" },
  bachelor: { title: () => "Last Call Before the Vows", marg: "Best Man", bourbon: "Last Call", zero: "Designated Groomsman" },
  bridalShower: { title: () => "Showered with Love", marg: "Bride-to-Be", bourbon: "Here Comes the Bride", zero: "Sweet Something" },
  babyShower: { title: () => "Sip Sip Hooray", marg: "Oh Baby", bourbon: "Rock-a-Bye", zero: "Mama-to-Be" },
  anniversary: {
    title: ({ years }) => (years ? `Cheers to ${inWords(years)} Years` : "Still Toasting"),
    marg: "Still Crushing",
    bourbon: "Old Flame",
    oldFashioned: "The Old Flame",
    zero: "Sweethearts",
  },
  graduation: {
    title: ({ year }) => (year ? `The Class of ${year}` : "The Grad Bar"),
    marg: "Top of the Class",
    bourbon: "Diploma",
    zero: "Honor Roll",
  },
  retirement: { title: () => "Officially Off the Clock", marg: "Out of Office", bourbon: "Golden Years", zero: "Permanent Vacation" },
  holiday: { title: () => "Merry & Bright", marg: "Fa La La", bourbon: "Naughty List", zero: "Nice List" },
  newYear: { title: () => "Out with the Old", marg: "Countdown", bourbon: "Auld Lang Syne", zero: "Resolution" },
  halloween: { title: () => "The Witching Hour", marg: "Black Magic", bourbon: "Hocus Pocus", zero: "Trick or Treat" },
  thanksgiving: { title: () => "Grateful & Garnished", marg: "Gobble Gobble", bourbon: "Second Helping", zero: "Grateful" },
  july4: { title: () => "Red, White & Revelrita", marg: "Firecracker", bourbon: "Star-Spangled", zero: "Sparkler" },
  work: { title: () => "Happy Hour, Upgraded", marg: "Overtime", bourbon: "Corner Office", zero: "Reply All" },
  launch: { title: () => "Grand Opening Pours", marg: "Ribbon Cutting", bourbon: "Launch Party", zero: "Soft Open" },
  party: { title: ({ season }) => seasonTitles[season], marg: "Good Times", bourbon: "Late Night", zero: "Designated Driver" },
} satisfies Record<string, Theme>;

type ThemeKey = keyof typeof themes;

/** The occasion, from what they wrote (most specific first), then the event type, then the date */
function themeOf(said: string, eventType: string, month: number | null): ThemeKey {
  const rules: [RegExp, ThemeKey][] = [
    [/bachelorette|hen party|bach party/, "bachelorette"],
    [/bachelor\b|stag\b/, "bachelor"],
    [/bridal shower|wedding shower/, "bridalShower"],
    [/baby shower|baby sprinkle|gender reveal|sip and see/, "babyShower"],
    [/rehearsal/, "rehearsal"],
    [/engage/, "engagement"],
    [/anniversar|vow renewal/, "anniversary"],
    [/wedding|reception|elop|nuptial/, "wedding"],
    [/birthday|bday|b-day|turning \d+|\d+(?:st|nd|rd|th)\b/, "birthday"],
    [/graduat|grad party|class of/, "graduation"],
    [/retire/, "retirement"],
    [/new year|\bnye\b/, "newYear"],
    [/christmas|xmas|holiday|hanukkah|festive|ugly sweater/, "holiday"],
    [/halloween|spooky|costume party/, "halloween"],
    [/friendsgiving|thanksgiving/, "thanksgiving"],
    [/fourth of july|4th of july|july 4|independence day/, "july4"],
    [/corporate|company|work party|office|team|client|employee|offsite|staff|conference/, "work"],
    [/pop-?up|launch|grand opening|activation|brand/, "launch"],
  ];
  const hit = rules.find(([re]) => re.test(said));
  if (hit) return hit[1];
  // Not "wedding": it's the event type a proposal gets when nothing says otherwise
  if (eventType === "corporate") return month === 12 ? "holiday" : "work";
  if (eventType === "popup") return "launch";
  return month === 12 ? "holiday" : "party";
}

/** "35th birthday", "turning 40", "a 30 year old": the age, or null */
function ageIn(said: string) {
  const m = said.match(/\b(\d{1,2})(?:st|nd|rd|th)\b|turning (\d{1,2})\b|\b(\d{1,2})[- ]?(?:year|yr)s?[- ]old/);
  const n = m ? Number(m[1] ?? m[2] ?? m[3]) : 0;
  return n > 0 ? n : null;
}

/** "10th anniversary", "25 years": the years, or null */
function yearsIn(said: string) {
  const m = said.match(/\b(\d{1,2})(?:st|nd|rd|th)? (?:wedding )?anniversary|\b(\d{1,2}) years\b/);
  const n = m ? Number(m[1] ?? m[2]) : 0;
  return n > 0 ? n : null;
}

/* ---------- the menu ---------- */

const beerAndWine = ["Mexican lager", "Local IPA", "Rosé", "Sauvignon blanc"];
const titleCase = (s: string) => s.replace(/\b\p{Ll}/gu, (c) => c.toUpperCase());

export function mockMenu({
  drinks,
  kind,
  vibe,
  name = "",
  eventType = "",
  date,
  month: monthFromText,
  year: yearFromText,
}: {
  /** The form's drinks choice: beer-wine, beer-wine-cocktails, mocktails, unsure (or blank) */
  drinks: string;
  kind: string;
  vibe: string;
  /** Their first name, for a birthday's title */
  name?: string;
  /** The proposal's event type (private, corporate, popup), when the words don't say */
  eventType?: string;
  /** YYYY-MM-DD of their (first) date, for the season */
  date?: string;
  /** Or the month (1-12), when all there is is a date written out */
  month?: number | null;
  /** The event's year, for a graduation's title */
  year?: number | null;
}): { menuTitle: string; menu: string } {
  const said = `${kind} ${vibe}`.toLowerCase();
  const iso = date && /^\d{4}-\d{2}/.test(date) ? date : "";
  const month = iso ? Number(iso.slice(5, 7)) : (monthFromText ?? null);
  const season = seasonOf(month);
  const party: Party = {
    name: titleCase(name.trim().split(/\s+/)[0] ?? ""),
    age: ageIn(said),
    years: yearsIn(said),
    year: Number(said.match(/class of (20\d\d)/)?.[1]) || (iso ? Number(iso.slice(0, 4)) : (yearFromText ?? null)),
    season,
  };
  const theme: Theme = themes[themeOf(said, eventType, month)];
  const f = flavors[season];

  const menuTitle = theme.title(party);
  const marg = `${theme.marg} ${f.fruit} Marg | ${f.marg}`;
  const bourbon = `${f.bourbon === "Old Fashioned" && theme.oldFashioned ? theme.oldFashioned : `${theme.bourbon} ${f.bourbon}`} | ${f.bourbonIng}`;
  const zero = `${theme.zero} ${f.zero} | ${f.zeroIng}`;
  const wedding = /wedding|reception|rehearsal|elop|vow/.test(said);
  const pours = wedding ? [...beerAndWine, "Sparkling for the toast"] : beerAndWine;
  const noBooze =
    drinks === "mocktails" ||
    (!drinks && /mocktail|no alcohol|alcohol.free|sober|dry |zero.proof|non.alcoholic/.test(said));

  if (noBooze) {
    return {
      menuTitle,
      menu: [
        "# Zero proof",
        `${theme.marg} ${f.fruit} No-Rita | ${f.fruit.toLowerCase()}, lime, agave, soda, salt rim`,
        zero,
        `${theme.bourbon} Pineapple Fizz | fresh pineapple, ginger, lime, soda`,
      ].join("\n"),
    };
  }
  if (drinks === "beer-wine") {
    return { menuTitle, menu: ["# Beer and wine", ...pours, "# Zero proof", zero].join("\n") };
  }
  // Cocktails, or they're not sure yet: Helen's three signatures
  return {
    menuTitle,
    menu: ["# Signature cocktails", marg, bourbon, STOLI_LINE, "# Zero proof", zero, "# Beer and wine", ...pours].join("\n"),
  };
}

/* ---------- menus from the first generator ---------- */

const OLD_TITLES = ["Two signature cocktails, beer and wine", "Beer and wine, plus a zero-proof pick", "Three zero-proof signatures"];
const OLD_DRINKS = new Set([
  "Passion Fruit Marg | tequila blanco, passion fruit, lime, agave",
  "Cucumber Cooler | cucumber vodka infused overnight, mint, lime, soda",
  "Spicy Cucumber Marg | jalapeño tequila, cucumber, lime, agave, tajín rim",
  "Charcoal Marg | tequila blanco, activated charcoal, lime, agave, black salt rim",
  "Hibiscus Marg | tequila blanco, hibiscus, lime, agave",
  "Lavender Gin Fizz | gin, lavender honey syrup, lemon, soda",
  "Elderflower Spritz | elderflower liqueur, sparkling wine, soda, lemon twist",
  "Aperol Spritz | Aperol, prosecco, soda, orange",
  "Paloma | tequila blanco, fresh grapefruit, lime, soda, salt rim",
  "Ranch Water | tequila blanco, fresh lime, Topo Chico",
  "Whiskey Smash | bourbon, lemon, mint, simple syrup",
  "Pineapple Rum Smash | rum, pineapple, lime, mint",
  "Moscow Mule | vodka, ginger beer, fresh lime",
  "Spiced Apple Mule | bourbon, apple cider, ginger beer, cinnamon",
  "Cranberry Rosemary Mule | vodka, cranberry, ginger beer, lime, rosemary",
  "Espresso Martini | vodka, fresh espresso, coffee liqueur",
  "French 75 | gin, lemon, sparkling wine",
  "Hibiscus Lemonade | hibiscus, lemon, agave, soda",
  "Cucumber Mint Cooler | cucumber, mint, lime, soda",
  "Passion Fruit Spritz | passion fruit, lime, agave, soda",
  "Spicy Pineapple Fresca | pineapple, jalapeño, lime, agave, soda",
  "Ginger Mint Mule | ginger beer, lime, mint",
  "Lavender Lemonade | lavender syrup, lemon, soda",
  "Cranberry Ginger Fizz | cranberry, ginger beer, lime, rosemary",
  "Spiced Apple Cider Spritz | apple cider, cinnamon, lemon, soda",
]);
const OLD_LINES = new Set(["# Signature cocktails", "# Zero proof", "# Beer and wine", ...beerAndWine, "Sparkling for the toast"]);

/**
 * A mock-up menu the first generator made (before the themed ones) that Helen hasn't touched:
 * its heading, and every line, word for word, one it could have written. Drafts swap these for
 * a themed menu.
 */
export function isOldMockUp(title: string, menu: string) {
  return (
    OLD_TITLES.includes(title.trim()) &&
    menu
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .every((l) => OLD_LINES.has(l) || OLD_DRINKS.has(l))
  );
}
