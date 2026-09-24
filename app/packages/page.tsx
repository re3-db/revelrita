import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { bottlesDrinkware } from "@/lib/images";
import { delay } from "@/lib/site";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Beer and wine, beer wine and cocktails, or mocktails. Every Revelrita package includes the cart, bartenders, custom menu, ice, drinkware, garnish and setup.",
};

const included = [
  ["The cart", "Parked, styled and lit"],
  ["Bartenders", "Staffed to your guest count"],
  ["Beverage consultation", "Expert guidance on drink selection"],
  ["Custom menu planning", "Built around your event"],
  ["Ice and drinkware", "Brought, chilled, stocked"],
  ["Garnish", "So every drink looks the part"],
  ["Lemon water", "Always near the bar"],
  ["Setup and breakdown", "We arrive early, leave clean"],
  ["Liability coverage", "$1M general liability"],
  ["Your shopping list", "Down to the bottle"],
];

const addOns = [
  "Custom cups",
  "Custom napkins",
  "Custom menu signage",
  "Whiskey blocks",
  "Pebble ice",
  "Sodas, seltzers and waters, stocked",
  "Tray-passed welcome champagne",
  "Champagne toast service",
  "A zero proof menu alongside",
  "Cart styling, flowers or greenery",
  "Commercial grade sound",
  "Extra hours or bartenders",
];
const pillColors = ["bg-sky", "bg-blush", "bg-peach"];

export default function PackagesPage() {
  return (
    <>
      <section className="subhero">
        <div className="wrap center reveal">
          <p className="eyebrow">Packages</p>
          <h1 className="mx-auto mb-0 mt-[16px]">Pick what&apos;s in the glass. We&apos;ll handle the rest.</h1>
          <p className="lede mx-auto mb-0 mt-[14px]">
            Every package comes with the cart, the bartenders and everything that makes a bar a bar. Hours and staffing
            scale with your guest count, so reach out and we&apos;ll put a number to your date.
          </p>
          <Link className="btn mt-[26px]" href="/book">
            Ask for a quote
          </Link>
        </div>
      </section>

      <section className="pad pt-[clamp(20px,3vw,40px)]">
        <div className="wrap">
          <div className="steps">
            <div className="step reveal bg-sky">
              <h3 className="mt-0">Beer and wine</h3>
              <p className="text-ink">
                The easy one. A tight, well-chosen list poured properly, with the cart doing the heavy lifting on
                atmosphere.
              </p>
            </div>
            <div className="step reveal bg-blush" style={delay(110)}>
              <h3 className="mt-0">Beer, wine and cocktails</h3>
              <p className="text-ink">
                The one most people book. Two or three signature cocktails built for your event, alongside beer and wine
                for everybody else.
              </p>
            </div>
            <div className="step reveal bg-peach" style={delay(220)}>
              <h3 className="mt-0">Mocktails</h3>
              <p className="text-ink">
                Zero proof, same craft. Fresh juice, real technique, proper drinkware. On its own or sitting next to the
                cocktails.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="deep pad">
        <div className="wrap duo">
          <div className="reveal">
            <h2 className="big">Every package includes</h2>
            <p className="lede text-[#D6E7F0]">Whichever one you pick, this all rolls in with the cart.</p>
          </div>
          <ul className="speclist reveal mt-0 text-cream" style={delay(110)}>
            {included.map(([item, detail]) => (
              <li key={item} className="border-[rgba(255,249,233,.28)]">
                <span>{item}</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pad">
        <div className="wrap">
          <h2 className="big center reveal">Add ons</h2>
          <p className="lede center reveal mx-auto mb-0 mt-[12px] max-w-[56ch] text-balance">
            The things people add when they want the bar to feel like theirs.
          </p>
          <div className="gal addons reveal mt-[34px]" style={delay(110)}>
            {addOns.map((a, i) => (
              <span key={a} className={`pill ${pillColors[i % 3]} text-center py-[18px] px-[20px]`}>
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="story pad">
        <div className="wrap duo">
          <div className="reveal">
            <p className="eyebrow text-ink">How the money works</p>
            <h2 className="big my-[14px]">Your investment, split in two.</h2>
            <p className="text-ink">
              <strong>One from Revelrita</strong> for the bar: the cart, the crew, the ice, the drinkware, the juice and
              garnish, the setup and the breakdown.
            </p>
            <p className="text-ink mt-[14px]">
              <strong>One from the liquor store</strong> for the alcohol, which you buy yourself at their prices, with
              nothing marked up by us. We build the list down to the bottle, and anything still sealed at the end goes home
              with you.
            </p>
            <Link className="btn ink mt-[24px]" href="/book">
              Ask for a quote
            </Link>
          </div>
          <Image
            className="tall reveal"
            style={delay(120)}
            src={bottlesDrinkware}
            alt="Bottles and drinkware set out on a bar table"
            sizes="(max-width: 1000px) 100vw, 50vw"
          />
        </div>
      </section>
    </>
  );
}
