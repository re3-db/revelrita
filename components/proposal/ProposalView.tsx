import Image, { type StaticImageData } from "next/image";
import { Fragment, type ReactNode } from "react";
import {
  logoCream,
  proposalBar,
  proposalBartender,
  proposalBottles,
  proposalCart,
  proposalCounter,
  proposalDrinks,
  proposalGuest,
  proposalHelen,
  proposalToast,
} from "@/lib/images";
import { money, pricedRows, type PhotoKey, type ProposalContent } from "@/lib/proposals";

/**
 * A client's proposal: a port of render() from Helen's proposal builder artifact. Same
 * slides, same markup and class names (styled by app/(proposals)/proposal.css), same rules
 * for when a slide or photo shows. Used by /proposal/[id] and the builder's preview.
 */

export const photos: Record<PhotoKey, { src: StaticImageData; alt: string }> = {
  guest: { src: proposalGuest, alt: "A guest laughing with a drink at dusk" },
  bottles: { src: proposalBottles, alt: "Wine, cans and flowers set out on the bar" },
  helen: { src: proposalHelen, alt: "Helen with the Revelrita cart" },
  bartender: { src: proposalBartender, alt: "Guests lining up at the cart at golden hour" },
  cart: { src: proposalCart, alt: "The Revelrita bar cart at dusk" },
  counter: { src: proposalCounter, alt: "The cart counter with flowers and the cocktail menu" },
  bar: { src: proposalBar, alt: "The bar top with wine at dusk" },
  drinks: { src: proposalDrinks, alt: "Two margaritas with dried lime wheels on the bar" },
  toast: { src: proposalToast, alt: "Three guests toasting with margaritas" },
};

// Every photo loads up front (not lazily), as in the artifact, so "Save as PDF" never prints a gap.
// Sizes match the CSS: slides are at most 1120px wide and stack into one column at 820px.
const sizes = {
  full: "(max-width: 1160px) 100vw, 1120px",
  hero: "(max-width: 820px) 100vw, 560px",
  col: "(max-width: 820px) 100vw, 520px",
  money: "(max-width: 820px) 100vw, 580px",
};

/** Non-empty trimmed lines */
const lines = (s: string) =>
  String(s || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

/** "title | sentence" lines */
const pairs = (s: string) =>
  lines(s)
    .map((l) => {
      const parts = l.split("|");
      return { t: (parts[0] || "").trim(), b: (parts[1] || "").trim() };
    })
    .filter((x) => x.t);

/** Text with single line breaks kept */
function breaks(s: string) {
  return s.split("\n").map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {part}
    </Fragment>
  ));
}

/** Blank lines start a new paragraph */
function paras(s: string) {
  return String(s || "")
    .split(/\n{2,}/)
    .filter((p) => p.trim())
    .map((p, i) => <p key={i}>{breaks(p.trim())}</p>);
}

export default function ProposalView({
  content: d,
  topbar,
  preload = false,
}: {
  content: ProposalContent;
  /** The admin's "This is what your client sees" bar */
  topbar?: ReactNode;
  /** Preload the hero photo and logo (the client's page, where they're above the fold) */
  preload?: boolean;
}) {
  const type = d.eventType || "wedding";
  const greetWord = type === "corporate" || type === "popup" ? "Hi" : "Hey";
  const name = d.name.trim() || "there";
  const shows = (k: PhotoKey) => d.photos.includes(k);
  const img = (k: PhotoKey, size: string, cls?: string) =>
    shows(k) ? <Image className={cls} src={photos[k].src} alt={photos[k].alt} sizes={size} loading="eager" /> : null;
  const logo = <Image className="logo" src={logoCream} alt="Revelrita" preload={preload} loading="eager" />;

  const facts = (
    [
      ["Occasion", d.occasion],
      ["Date", d.date],
      ["Where", d.venue],
      ["Guests", d.guests],
      ["Service", d.serviceWindow],
    ] as const
  ).filter(([, v]) => v.trim());

  /* ---------- the menu ---------- */
  const drinks = lines(d.menu)
    .map((l) => {
      if (l.charAt(0) === "#") return { group: l.slice(1).trim() };
      const parts = l.split("|");
      return { name: (parts[0] || "").trim(), ing: (parts[1] || "").trim() };
    })
    .filter((x) => x.group || x.name);
  const menu: ReactNode[] = [];
  let pend: string[] = [];
  const flush = () => {
    if (pend.length) {
      const names = pend;
      menu.push(
        <p className="pours" key={menu.length}>
          {names.map((n, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <>
                  {" "}
                  <span className="dot">&middot;</span>{" "}
                </>
              )}
              {n}
            </Fragment>
          ))}
        </p>,
      );
      pend = [];
    }
  };
  for (const x of drinks) {
    if (x.group !== undefined) {
      flush();
      menu.push(
        <p className="mgroup" key={menu.length}>
          {x.group}
        </p>,
      );
    } else if (!x.ing) {
      pend.push(x.name);
    } else {
      flush();
      menu.push(
        <div className="drink" key={menu.length}>
          <div className="name">{x.name}</div>
          <div className="ing">{x.ing}</div>
        </div>,
      );
    }
  }
  flush();

  /* ---------- the numbers ---------- */
  const { rows, counted, total } = pricedRows(d.pricing);
  const terms = [
    d.peak && (
      <li className="peak" key="peak">
        {d.peak}
      </li>
    ),
    d.deposit && <li key="dep">{d.deposit}</li>,
    d.pricingNote && <li key="pn">{d.pricingNote}</li>,
    d.holdsFor && <li key="hold">{d.holdsFor}</li>,
  ].filter(Boolean);

  const included = lines(d.included);
  const diffs = pairs(d.different);
  const inTheNumber = pairs(d.inTheNumber);
  const faqs = lines(d.faq)
    .map((l) => {
      const parts = l.split("|");
      return { q: (parts[0] || "").trim(), a: (parts[1] || "").trim() };
    })
    .filter((x) => x.q);
  const steps = lines(d.steps);

  const visionPhoto = shows("toast") ? "toast" : shows("bartender") ? "bartender" : null;
  const featurePhoto = shows("bar") ? "bar" : shows("bartender") ? "bartender" : null;

  return (
    <div id="proposal" data-event={type}>
      {topbar}
      <div id="proposalBody">
        {/* ---------- 1. hero ---------- */}
        <section className="slide hero-slide">
          <div className="hero-copy">
            {logo}
            <h1 className="hello">
              {greetWord},<br />
              <span className="nm">{name}.</span>
            </h1>
            {d.intro.trim() && <p className="sub">{breaks(d.intro.trim())}</p>}
            {facts.length > 0 && (
              <div className="hero-facts">
                {facts.map(([k, v]) => (
                  <div className="detail" key={k}>
                    <span className="k">{k}</span>
                    <span className="v">{v.trim()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {shows("cart") && (
            <div className="hero-art">
              <Image src={photos.cart.src} alt={photos.cart.alt} sizes={sizes.hero} preload={preload} loading="eager" />
            </div>
          )}
        </section>

        {/* ---------- 2. the opening statement ---------- */}
        {(d.visionBody.trim() || d.visionTitle.trim()) && (
          <section className="slide vision-slide">
            {visionPhoto && (
              <Image
                className="vision-bg"
                src={photos[visionPhoto].src}
                alt={photos[visionPhoto].alt}
                sizes={sizes.full}
                loading="eager"
              />
            )}
            <div className="vision-card">
              {d.visionTitle.trim() && <h2 className="vision-title">{d.visionTitle.trim()}</h2>}
              {d.visionBody.trim() && <div className="vision-body">{paras(d.visionBody)}</div>}
            </div>
          </section>
        )}

        {/* ---------- 3. what's included ---------- */}
        {(d.packageName.trim() || included.length > 0) && (
          <section className="slide split">
            <div className="cols">
              <div className="col-text">
                <span className="eyebrow">The package</span>
                <h2 className="sec-title">{d.packageName.trim() || "What's Included"}</h2>
                {included.length > 0 && (
                  <ul className="includes">
                    {included.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                )}
              </div>
              {shows("counter") && <div className="col-art">{img("counter", sizes.col)}</div>}
            </div>
          </section>
        )}

        {/* ---------- 3b. what makes us different ---------- */}
        {diffs.length > 0 && (
          <section className="slide feature-slide">
            {featurePhoto && (
              <Image
                className="feature-bg"
                src={photos[featurePhoto].src}
                alt={photos[featurePhoto].alt}
                sizes={sizes.full}
                loading="eager"
              />
            )}
            <div className="feature-inner">
              <h2 className="feature-title">
                What makes <em>Revelrita</em> different
              </h2>
              <div className="feat-row">
                {diffs.slice(0, 4).map((x, i) => (
                  <div className="feat" key={i}>
                    <div className="feat-t">{x.t}</div>
                    {x.b && <div className="feat-b">{x.b}</div>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------- 4. the menu ---------- */}
        {drinks.length > 0 && (
          <section className="slide split">
            <div className="cols flip">
              <div className="col-text">
                <span className="eyebrow">Mock up menu (subject to change!)</span>
                <h2 className="sec-title">
                  {d.menuTitle.trim() || (
                    <>
                      The <em>Menu</em>
                    </>
                  )}
                </h2>
                {menu}
              </div>
              {shows("drinks") && <div className="col-art">{img("drinks", sizes.col)}</div>}
            </div>
          </section>
        )}

        {/* ---------- 5. the numbers ---------- */}
        {rows.length > 0 && (
          <section className="slide numbers-slide">
            <span className="eyebrow">Investment</span>
            <h2 className="sec-title">
              The <em>Numbers</em>
            </h2>
            <div className="numbers-grid">
              <div>
                {counted.length === 1 && rows.length === 1 ? (
                  <div className="stat">
                    <div className="stat-amt">{rows[0].display}</div>
                    {rows[0].label && <div className="stat-lbl">{rows[0].label}</div>}
                    {rows[0].note && <div className="stat-note">{rows[0].note}</div>}
                  </div>
                ) : (
                  <>
                    <div className="stat-row">
                      {rows.map((r, i) => (
                        <div className="stat" key={i}>
                          <div className="stat-amt">{r.display}</div>
                          <div className="stat-lbl">{r.label}</div>
                          {r.note && <div className="stat-note">{r.note}</div>}
                        </div>
                      ))}
                    </div>
                    {counted.length > 1 && (
                      <div className="stat total-line">
                        <div className="stat-amt">{money(total)}</div>
                        <div className="stat-lbl">Service total</div>
                      </div>
                    )}
                  </>
                )}
                {terms.length > 0 && <ul className="terms">{terms}</ul>}
              </div>
              <div className="money-note">
                {img("bottles", sizes.money, "money-img")}
                {inTheNumber.length > 0 && (
                  <>
                    <h3 className="money-h">What&apos;s in the number</h3>
                    <ul className="wn">
                      {inTheNumber.map((x, i) => (
                        <li key={i}>
                          <span className="wn-t">{x.t}</span>
                          {x.b && <span className="wn-b">{x.b}</span>}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {d.alcohol.trim() && (
                  <>
                    <h3 className="money-h">About the alcohol</h3>
                    {paras(d.alcohol)}
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ---------- 6b. questions people ask ---------- */}
        {faqs.length > 0 && (
          <section className="slide faq-slide">
            <span className="eyebrow">Good questions</span>
            <h2 className="sec-title">Good to know</h2>
            <div className="cols faq-cols">
              <div className="faq-grid one">
                {faqs.map((x, i) => (
                  <div className="faq" key={i}>
                    <div className="faq-q">{x.q}</div>
                    {x.a && <div className="faq-a">{x.a}</div>}
                  </div>
                ))}
              </div>
              {shows("bartender") && <div className="col-art">{img("bartender", sizes.col)}</div>}
            </div>
          </section>
        )}

        {/* ---------- 7. what's next ---------- */}
        {(steps.length > 0 || d.email.trim() || d.phone.trim()) && (
          <section className="slide split">
            <div className="cols flip">
              <div className="col-text">
                <span className="eyebrow">Next steps</span>
                <h2 className="sec-title">
                  What&apos;s <em>Next</em>
                </h2>
                {steps.length > 0 && (
                  <ol className="steps">
                    {steps.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ol>
                )}
                {(d.email.trim() || d.phone.trim()) && (
                  <div className="cta-row">
                    {d.email.trim() && <span className="btn">{d.email.trim()}</span>}
                    {d.phone.trim() && <span className="btn ghost">{d.phone.trim()}</span>}
                  </div>
                )}
              </div>
              {shows("guest") ? (
                <div className="col-art">{img("guest", sizes.col)}</div>
              ) : shows("bartender") ? (
                <div className="col-art">{img("bartender", sizes.col)}</div>
              ) : null}
            </div>
          </section>
        )}

        {/* ---------- 4b. what a client said ---------- */}
        {d.quote.trim() && (
          <section className="slide quote-slide">
            <div className="cols">
              <div className="col-text">
                <span className="eyebrow">A recent host</span>
                <blockquote className="quote">{paras(d.quote)}</blockquote>
                {d.quoteBy.trim() && <p className="quote-by">{d.quoteBy.trim()}</p>}
              </div>
              {shows("helen") && <div className="col-art">{img("helen", sizes.col)}</div>}
            </div>
          </section>
        )}

        {/* ---------- 8. sign-off ---------- */}
        <section className="slide sign-slide">
          {logo}
          <p className="sig">{d.signOff.trim() || "Let's make it a party!"}</p>
          <p className="contact">
            Helen, Revelrita
            {d.email.trim() && (
              <>
                <br />
                {d.email.trim()}
              </>
            )}
            {d.phone.trim() && (
              <>
                <br />
                {d.phone.trim()}
              </>
            )}
          </p>
          <p className="tag">The bar that comes to you. Cardiff, California.</p>
        </section>
      </div>
    </div>
  );
}
