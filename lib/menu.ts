/**
 * The mock-up menu on a draft proposal, built from what the client sent through the form:
 * their drinks choice sets the shape (cocktails, beer and wine, or zero proof), and the
 * season of their date, their event type and words in their "vibe" pick the drinks. Same
 * inquiry, same menu (no randomness). The proposal labels it "Mock up menu (subject to
 * change!)", and Helen edits it like any other field.
 */

type Drink = {
  name: string;
  /** Shown under the name on the proposal */
  ing: string;
  /** For variety: two signatures never share a base spirit */
  base: string;
  /** Words in their answers that make this drink a fit */
  fits: RegExp;
  /** Months it's best in (1-12), empty for any time */
  months?: number[];
};

const SPRING = [3, 4, 5];
const SUMMER = [6, 7, 8, 9];
const FALL = [9, 10, 11];
const WINTER = [11, 12, 1, 2];

// In order of preference when nothing in their answers says otherwise
const cocktails: Drink[] = [
  { name: "Passion Fruit Marg", ing: "tequila blanco, passion fruit, lime, agave", base: "tequila", fits: /tequila|marg|tropical|beach|coastal|fiesta|summer|bright|fun/, months: [...SPRING, ...SUMMER] },
  { name: "Cucumber Cooler", ing: "cucumber vodka infused overnight, mint, lime, soda", base: "vodka", fits: /vodka|cucumber|fresh|light|garden|refresh|summer|brunch/, months: [...SPRING, ...SUMMER] },
  { name: "Spicy Cucumber Marg", ing: "jalapeño tequila, cucumber, lime, agave, tajín rim", base: "tequila", fits: /spic|jalape|heat|tequila|marg|taco|fiesta|mexic/, months: SUMMER },
  { name: "Charcoal Marg", ing: "tequila blanco, activated charcoal, lime, agave, black salt rim", base: "tequila", fits: /charcoal|black|moody|dark|halloween|edgy|night/, months: [...FALL, ...WINTER] },
  { name: "Hibiscus Marg", ing: "tequila blanco, hibiscus, lime, agave", base: "tequila", fits: /hibiscus|pink|floral|flower|boho|bridal|shower|fiesta|tequila|marg/ },
  { name: "Lavender Gin Fizz", ing: "gin, lavender honey syrup, lemon, soda", base: "gin", fits: /gin|lavender|floral|flower|boho|garden|bridal|shower|spring|tea/, months: [...SPRING, ...SUMMER] },
  { name: "Elderflower Spritz", ing: "elderflower liqueur, sparkling wine, soda, lemon twist", base: "spritz", fits: /elderflower|spritz|brunch|bubbl|champagne|prosecco|floral|flower|bridal|shower|garden|elegant/, months: [...SPRING, ...SUMMER] },
  { name: "Aperol Spritz", ing: "Aperol, prosecco, soda, orange", base: "spritz", fits: /aperol|spritz|ital|europe|brunch|sunset|golden|aperitivo/, months: [...SPRING, ...SUMMER] },
  { name: "Paloma", ing: "tequila blanco, fresh grapefruit, lime, soda, salt rim", base: "tequila", fits: /paloma|grapefruit|tequila|beach|coastal|surf|ocean|pool|summer/, months: SUMMER },
  { name: "Ranch Water", ing: "tequila blanco, fresh lime, Topo Chico", base: "tequila", fits: /ranch|western|cowboy|cowgirl|rodeo|country|barn|texas|disco|nashville/ },
  { name: "Whiskey Smash", ing: "bourbon, lemon, mint, simple syrup", base: "whiskey", fits: /whisk|bourbon|western|cowboy|cowgirl|rodeo|country|barn|rustic|derby/ },
  { name: "Pineapple Rum Smash", ing: "rum, pineapple, lime, mint", base: "rum", fits: /rum|tiki|tropic|hawai|luau|island|pineapple|beach|pool/, months: SUMMER },
  { name: "Moscow Mule", ing: "vodka, ginger beer, fresh lime", base: "vodka", fits: /mule|ginger|vodka|classic|crowd|corporate|work|office|team|client/ },
  { name: "Spiced Apple Mule", ing: "bourbon, apple cider, ginger beer, cinnamon", base: "whiskey", fits: /apple|cider|fall|autumn|harvest|pumpkin|thanksgiving|friendsgiving|cozy/, months: FALL },
  { name: "Cranberry Rosemary Mule", ing: "vodka, cranberry, ginger beer, lime, rosemary", base: "vodka", fits: /cranberr|rosemary|holiday|christmas|xmas|festive|winter|ugly sweater|new year|nye/, months: WINTER },
  { name: "Espresso Martini", ing: "vodka, fresh espresso, coffee liqueur", base: "vodka", fits: /espresso|coffee|martini|late|night|nye|new year|chic|glam|corporate|work|office/ },
  { name: "French 75", ing: "gin, lemon, sparkling wine", base: "gin", fits: /french|champagne|toast|elegant|classic|glam|anniversar|engag|new year|nye/ },
];

const zeroProof: Drink[] = [
  { name: "Hibiscus Lemonade", ing: "hibiscus, lemon, agave, soda", base: "na", fits: /hibiscus|pink|floral|flower|boho|bridal|shower|kid|family|lemonade/ },
  { name: "Cucumber Mint Cooler", ing: "cucumber, mint, lime, soda", base: "na", fits: /cucumber|mint|fresh|light|garden|summer|brunch/, months: [...SPRING, ...SUMMER] },
  { name: "Passion Fruit Spritz", ing: "passion fruit, lime, agave, soda", base: "na", fits: /passion|tropic|beach|coastal|summer|bright/, months: SUMMER },
  { name: "Spicy Pineapple Fresca", ing: "pineapple, jalapeño, lime, agave, soda", base: "na", fits: /spic|jalape|pineapple|taco|fiesta|mexic|tropic/ },
  { name: "Ginger Mint Mule", ing: "ginger beer, lime, mint", base: "na", fits: /mule|ginger|classic|western|country|ranch|corporate|work|office/ },
  { name: "Lavender Lemonade", ing: "lavender syrup, lemon, soda", base: "na", fits: /lavender|floral|flower|garden|spring|tea|bridal/, months: SPRING },
  { name: "Cranberry Ginger Fizz", ing: "cranberry, ginger beer, lime, rosemary", base: "na", fits: /cranberr|holiday|christmas|xmas|festive|winter|thanksgiving|friendsgiving/, months: WINTER },
  { name: "Spiced Apple Cider Spritz", ing: "apple cider, cinnamon, lemon, soda", base: "na", fits: /apple|cider|fall|autumn|harvest|pumpkin|cozy/, months: FALL },
];

const beerAndWine = ["Mexican lager", "Local IPA", "Rosé", "Sauvignon blanc"];

/** The best `count` drinks for what they wrote and when, never two on the same base */
function pick(drinks: Drink[], said: string, month: number | null, count: number) {
  const scored = drinks
    .map((d, order) => {
      const fit = (said.match(new RegExp(d.fits.source, "g")) ?? []).length;
      const inSeason = !d.months || month === null || d.months.includes(month);
      return { d, score: fit * 3 + (inSeason ? 1 : -2), order };
    })
    .sort((a, b) => b.score - a.score || a.order - b.order);
  const chosen: Drink[] = [];
  for (const { d } of scored) {
    if (chosen.length === count) break;
    if (d.base !== "na" && chosen.some((c) => c.base === d.base)) continue;
    chosen.push(d);
  }
  return chosen;
}

const lines = (drinks: Drink[]) => drinks.map((d) => `${d.name} | ${d.ing}`);

export function mockMenu({
  drinks,
  kind,
  vibe,
  date,
}: {
  /** The form's drinks choice: beer-wine, beer-wine-cocktails, mocktails, unsure (or blank) */
  drinks: string;
  kind: string;
  vibe: string;
  /** YYYY-MM-DD of their (first) date, for the season */
  date?: string;
}): { menuTitle: string; menu: string } {
  const said = `${kind} ${vibe}`.toLowerCase();
  const month = date && /^\d{4}-\d{2}/.test(date) ? Number(date.slice(5, 7)) : null;
  const wedding = /wedding|bridal|reception|rehearsal|engage|elop|vow/.test(said);
  const pours = wedding ? [...beerAndWine, "Sparkling for the toast"] : beerAndWine;
  const noBooze = drinks === "mocktails" || (!drinks && /mocktail|no alcohol|alcohol.free|sober|dry |zero.proof|non.alcoholic/.test(said));

  if (noBooze) {
    return {
      menuTitle: "Three zero-proof signatures",
      menu: ["# Zero proof", ...lines(pick(zeroProof, said, month, 3))].join("\n"),
    };
  }
  if (drinks === "beer-wine") {
    return {
      menuTitle: "Beer and wine, plus a zero-proof pick",
      menu: ["# Beer and wine", ...pours, "# Zero proof", ...lines(pick(zeroProof, said, month, 1))].join("\n"),
    };
  }
  // Cocktails, or they're not sure yet: the classic Revelrita bar
  return {
    menuTitle: "Two signature cocktails, beer and wine",
    menu: [
      "# Signature cocktails",
      ...lines(pick(cocktails, said, month, 2)),
      "# Zero proof",
      ...lines(pick(zeroProof, said, month, 1)),
      "# Beer and wine",
      ...pours,
    ].join("\n"),
  };
}
