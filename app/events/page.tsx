import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ReviewCards from "@/components/ReviewCards";
import { friendsMargaritasGoldenHour, guestsAtBar } from "@/lib/images";
import { delay } from "@/lib/site";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Weddings, engagement parties, birthdays, work parties and pop-ups. Revelrita brings a fully staffed craft cocktail bar cart to events across San Diego County.",
};

const eventTypes = [
  "Weddings", "Engagement parties", "Rehearsal dinners", "Bridal showers", "Anniversaries",
  "Birthdays", "Backyard parties", "Graduations", "Baby showers", "Housewarmings",
  "Holiday parties", "Company offsites", "Client events", "Launch parties", "Retirements",
  "Pop-ups", "Brand activations", "Surf events", "Markets", "Fundraisers",
];
const pillColors = ["bg-sky", "bg-blush", "bg-peach"];

export default function EventsPage() {
  return (
    <>
      <section className="subhero bg-blush">
        <div className="wrap duo">
          <div className="reveal">
            <p className="eyebrow">Events</p>
            <h1 className="mt-[16px]">We pour at just about every kind of party.</h1>
            <p className="lede text-ink">
              Weddings, engagement parties, birthdays, pop-ups. Whatever it may be, Revelrita shows up and makes it one
              people talk about.
            </p>
            <Link className="btn mt-[28px]" href="/book">
              Check your date
            </Link>
          </div>
          <Image
            className="tall reveal"
            style={delay(120)}
            src={friendsMargaritasGoldenHour}
            alt="Friends holding margaritas at golden hour"
            sizes="(max-width: 1000px) 100vw, 50vw"
          />
        </div>
      </section>

      <section className="pad pt-[clamp(28px,4vw,52px)] pb-0">
        <div className="wrap">
          <h2 className="big center reveal">Everything we show up for</h2>
          <div className="pills reveal justify-center mt-[28px]" style={delay(100)}>
            {eventTypes.map((t, i) => (
              <span key={t} className={`pill ${pillColors[i % 3]}`}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="pad">
        <div className="wrap">
          <h2 className="big reveal">What you actually get</h2>
          <div className="steps">
            <div className="step reveal">
              <p className="num">01</p>
              <h3>A menu made for the event</h3>
              <p>
                We start with what you and your people actually drink, then build two or three signature cocktails around
                it. Your names on the menu card, or your dog&apos;s. Up to you.
              </p>
            </div>
            <div className="step reveal" style={delay(110)}>
              <p className="num">02</p>
              <h3>A bar, fully staffed</h3>
              <p>
                Cart, pebble ice, whiskey blocks, drinkware, fresh juice, herbs, dried citrus, a sound system, and
                bartenders who know how to move a line.
              </p>
            </div>
            <div className="step reveal" style={delay(220)}>
              <p className="num">03</p>
              <h3>Someone who sorts the logistics</h3>
              <p>
                Load-in times, power, where the cart parks, when the bar closes. We work that out with your venue, planner
                or office manager so it never lands on your plate.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pad pt-0">
        <div className="wrap">
          <div className="steps">
            <div className="step reveal bg-sky">
              <p className="num text-ink">Work parties</p>
              <h3>The one nobody sneaks out of early</h3>
              <p className="text-ink">
                Launches, holiday parties, client nights, offsites. Branded drinks if you want them, a clean setup, and an
                invoice your finance team will not argue with.
              </p>
            </div>
            <div className="step reveal bg-blush" style={delay(110)}>
              <p className="num text-ink">Birthdays and backyards</p>
              <h3>Your driveway, suddenly the best bar around</h3>
              <p className="text-ink">
                Birthdays, anniversaries, a Saturday that got out of hand. We pull in, set up, pour all night and pack out
                clean.
              </p>
            </div>
            <div className="step reveal bg-peach" style={delay(220)}>
              <p className="num text-ink">Pop-ups</p>
              <h3>A bar people photograph before they order</h3>
              <p className="text-ink">
                Brand activations, retail, surf events, markets and community nights. The cart is the draw, the drinks
                keep people there.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="band pad">
        <div className="wrap">
          <p className="statement reveal">
            <em>Six hundred drinks</em> at our own wedding taught us the thing most couples find out too late:{" "}
            <em>the bar</em> is where your party is won or lost.
          </p>
        </div>
      </section>

      <section className="pad">
        <div className="wrap duo">
          <Image
            className="tall reveal"
            src={guestsAtBar}
            alt="Guests leaning on the bar top talking to the bartender"
            sizes="(max-width: 1000px) 100vw, 50vw"
          />
          <div className="reveal" style={delay(120)}>
            <p className="eyebrow">The alcohol</p>
            <h2 className="big my-[14px]">You buy it. We mark up nothing.</h2>
            <p className="text-muted">
              We build the shopping list down to the bottle for your guest count, you pay liquor store prices, and
              whatever stays sealed goes home with you. It goes on your card at checkout, or you log into our Total Wine
              account and we take it from there.
            </p>
            <p className="text-muted mt-[14px]">Two invoices, no mystery: your alcohol, and our service fee.</p>
            <Link className="btn ink mt-[24px]" href="/faq">
              Read the details
            </Link>
          </div>
        </div>
      </section>

      <section className="reviews pad">
        <div className="wrap">
          <h2 className="big reveal">What people say after</h2>
          <ReviewCards names={["Emily Ferris", "Hanna Lee Hernandez", "Anne Gaskins"]} />
        </div>
      </section>

      <section className="story pad">
        <div className="wrap center reveal">
          <h2 className="big">Tell me about your day.</h2>
          <p className="lede text-ink mx-auto mb-0 mt-[14px]">
            Date, venue, guest count, and what the two of you like to drink. I&apos;ll come back with availability and a
            couple of menu ideas.
          </p>
          <Link className="btn ink mt-[26px]" href="/book">
            Check your date
          </Link>
        </div>
      </section>
    </>
  );
}
