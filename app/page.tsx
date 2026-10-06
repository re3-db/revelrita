import Image from "next/image";
import Link from "next/link";
import ContactLinks from "@/components/ContactLinks";
import HeroSlides from "@/components/HeroSlides";
import InquiryForm from "@/components/InquiryForm";
import ReviewCarousel from "@/components/ReviewCarousel";
import * as img from "@/lib/images";
import { press } from "@/lib/press";
import { delay } from "@/lib/site";

const heroSlides = [
  { src: img.heroCartWindow, alt: "The Revelrita bar cart window with a live edge bar top, wine bottles and a framed cocktail menu" },
  { src: img.heroWindowFlowers, alt: "The cart window with fresh flowers, a framed cocktail menu and the revelrita sign" },
  { src: img.heroGuestsOrdering, alt: "Guests ordering drinks at the cart window at a party" },
  { src: img.heroPinkMargaritas, alt: "Two pink margaritas with dried lime wheels on the live edge bar top" },
  { src: img.heroCartDusk, alt: "The sky blue cart with its sign lit up in a garden at dusk" },
];

const occasions = [
  { src: img.friendsMargaritasGoldenHour, alt: "Three friends with margaritas at golden hour", title: "Weddings", body: "Cocktail hour, reception, and a signature drink that is actually about you two." },
  { src: img.cartLawnGuests, alt: "The bar cart on a lawn with guests ordering drinks", title: "Work parties", body: "The company event nobody sneaks out of early." },
  { src: img.crowdBackyard, alt: "A crowd with drinks around the cart in a backyard", title: "Birthdays and backyards", body: "Your driveway, suddenly the best bar in the neighborhood." },
  { src: img.guestLaughing, alt: "A guest laughing and raising a drink", title: "Pop-ups", body: "A bar people photograph before they order from it." },
];

function Spark() {
  return (
    <svg className="spark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" aria-hidden="true">
      <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.7",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export default function HomePage() {
  return (
    <>
      <header className="hero" id="top">
        <div className="inner">
          <h1>
            The bar cart your party has <em>been waiting for.</em>
          </h1>
          <p className="sub">San Diego&apos;s mobile bar cart for craft&nbsp;cocktails.</p>
          <div className="cta">
            <a className="btn" href="#inquire">
              Check your date
            </a>
            <Link className="btn ink" href="/packages">
              See packages
            </Link>
          </div>
        </div>
        <div className="shot">
          <HeroSlides slides={heroSlides} />
        </div>
      </header>

      <section className="pad" id="parties">
        <div className="wrap">
          <div className="center reveal">
            <h2 className="big">We go where the people are</h2>
            <p className="lede">Backyards, venues, beaches and corporate offices. If your people are there, so are we.</p>
          </div>
          <div className="occ-grid">
            {occasions.map((o, i) => (
              <a key={o.title} className="occ reveal" href="#inquire" style={delay(i * 90)}>
                <Image src={o.src} alt={o.alt} sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 25vw" />
                <h3>{o.title}</h3>
                <p>{o.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="band pad">
        <div className="wrap">
          <p className="statement reveal">
            <em>The best hosts</em> are out there with a drink in hand, <em>not stuck</em> behind the bar making them.
          </p>
          <div className="trio reveal" style={delay(120)}>
            <Image src={img.guestLaughing} alt="A guest laughing with a drink" sizes="(max-width: 640px) 100vw, 33vw" />
            <Spark />
            <Image src={img.bottlesDrinkware} alt="Bottles and drinkware set out on a bar table" sizes="(max-width: 640px) 100vw, 33vw" />
            <Spark />
            <Image src={img.pinkSunsetGuests} alt="Guests around the cart under a pink sunset sky" sizes="(max-width: 640px) 100vw, 33vw" />
          </div>
        </div>
      </section>

      <section className="blush pad">
        <div className="wrap reveal">
          <h2>
            You bring the people.
            <br />
            We bring everything else.
          </h2>
        </div>
      </section>

      <svg className="wave" viewBox="0 0 1440 96" preserveAspectRatio="none" aria-hidden="true">
        <rect width="1440" height="96" fill="#FFB59A"></rect>
        <path
          d="M0 30q30 -26 60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0v70h-1440z"
          fill="#FB5718"
        ></path>
        <path
          d="M0 66q30 -26 60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0v34h-1440z"
          fill="#1F628E"
        ></path>
      </svg>

      <section className="deep pad" id="how">
        <div className="wrap">
          <h2 className="big reveal">We make it effortless</h2>
          <div className="cols">
            <div className="reveal">
              <svg {...iconProps}>
                <path d="M4 5h16l-7 8v6" />
                <path d="M9 19h6" />
                <path d="M8 9h8" />
              </svg>
              <h3>You buy the booze</h3>
              <p>
                We build the shopping list down to the bottle. You pay liquor store prices, nothing marked up, and unopened
                bottles go home with you.
              </p>
            </div>
            <div className="reveal" style={delay(110)}>
              <svg {...iconProps}>
                <path d="M3 16V9h14l4 4v3" />
                <circle cx="7" cy="18" r="2" />
                <circle cx="17" cy="18" r="2" />
                <path d="M3 9l2-4h9" />
              </svg>
              <h3>We pack the cart</h3>
              <p>
                Cart, pebble ice, whiskey blocks, drinkware, fresh juice, herbs, dried citrus, a sound system and the
                bartenders.
              </p>
            </div>
            <div className="reveal" style={delay(220)}>
              <svg {...iconProps}>
                <path d="M2.8 6.2l7.4 1.6-2.9 5.1z" />
                <path d="M7.3 12.9L6 18" />
                <path d="M3.6 18.8l5-1.4" />
                <path d="M21.2 6.2l-7.4 1.6 2.9 5.1z" />
                <path d="M16.7 12.9L18 18" />
                <path d="M20.4 18.8l-5-1.4" />
                <path d="M12 2.6v2.2M9.6 4l1 1.6M14.4 4l-1 1.6" />
              </svg>
              <h3>You get to be a guest</h3>
              <p>
                Two invoices, no mystery: your alcohol, and our service fee. We want you to know exactly what you&apos;re
                spending.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pad" id="cart">
        <div className="wrap split">
          <div className="cartshots reveal">
            <Image src={img.cart} alt="The Revelrita bar cart, a restored sky blue horse trailer" sizes="(max-width: 1000px) 100vw, 50vw" />
            <div className="row">
              <Image src={img.cartSunset} alt="The cart at a party under a sunset sky" sizes="(max-width: 1000px) 33vw, 17vw" />
              <Image src={img.barTopMenu} alt="The live edge bar top with bottles and a menu" sizes="(max-width: 1000px) 33vw, 17vw" />
              <Image src={img.guestsAtBar} alt="Guests leaning on the bar top talking to the bartender" sizes="(max-width: 1000px) 33vw, 17vw" />
            </div>
          </div>
          <div className="reveal" style={delay(120)}>
            <p className="eyebrow">The cart</p>
            <h2 className="big mt-[14px]">MEET THE PONY TRAILER TURNED RETRO BAR</h2>
            <p className="lede">
              Restored, painted sky blue, topped with live edge wood, and ready to pour craft cocktails for all of your
              guests all night long.
            </p>
            <div className="pills">
              <span className="pill">67&quot; &times; 143&quot;</span>
              <span className="pill">Live edge bar top</span>
              <span className="pill">Restored horse trailer</span>
              <span className="pill">Portable</span>
            </div>
          </div>
        </div>
      </section>

      <section className="story pad" id="story">
        <div className="wrap split">
          <div className="reveal">
            <div className="archwrap">
              <Image className="arch" src={img.helen} alt="Helen standing beside the Revelrita bar cart" sizes="(max-width: 500px) 100vw, 460px" />
            </div>
          </div>
          <div className="card reveal" style={delay(120)}>
            <p className="eyebrow">Behind the bar</p>
            <h2 className="big my-[14px]">Hi, I&apos;m Helen. I&apos;m so glad you&apos;re here!</h2>
            <p className="text-muted">
              I live in Cardiff, and I have a passion for bringing top notch bar service to events all over San Diego (and
              beyond!). I write the menus, I&apos;m usually the one pouring, and I&apos;m always the one who answers your
              email.
            </p>
            <p className="punch">Revelrita started at my own wedding.</p>
            <p className="text-muted">
              I needed to make six hundred drinks for less than a bajillion dollars. What I learned doing it: craft
              cocktails at scale are completely doable, they taste delicious, and nobody has to stand in a line for twenty
              minutes of a party.
            </p>
            <p className="punch">So I bought a pony trailer.</p>
            <p className="text-muted">
              Now I do it at other people&apos;s parties, except my drinks have gotten even better. I can&apos;t wait for you
              to see.
            </p>
            <a className="btn ink mt-[24px]" href="#inquire">
              Check your date
            </a>
          </div>
        </div>
      </section>

      <section className="pad" id="press">
        <div className="wrap">
          <div className="reveal">
            <p className="eyebrow">In the press</p>
            <h2 className="big mt-[14px]">Read all about it.</h2>
          </div>
          <div className="steps">
            {press.map((f, i) => (
              <a
                key={f.url}
                className="step reveal flex flex-col bg-white no-underline transition-transform duration-200 hover:-translate-y-[4px]"
                style={delay(i * 110)}
                href={f.url}
                target="_blank"
                rel="noopener"
              >
                <p className="num">{f.outlet}</p>
                <h3>{f.title}</h3>
                <p>{f.date}</p>
                <p className="mt-auto pt-[18px] font-sans text-[15px] font-semibold text-ember">Read the interview &rarr;</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="reviews pad" id="reviews">
        <div className="wrap">
          <div className="rev-head reveal">
            <div>
              <h2 className="big">Overheard at the cart.</h2>
            </div>
            <a className="btn" href="#inquire">
              Check your date
            </a>
          </div>
          <ReviewCarousel />
        </div>
      </section>

      <section className="pad" id="inquire">
        <div className="wrap split">
          <div className="reveal">
            <h2 className="big text-orange">Let&apos;s make it a party.</h2>
            <p className="lede">
              Tell us the date and a little about your people. We&apos;ll come back with availability and a few ideas for
              the bar.
            </p>
            <ContactLinks className="mt-[18px]" />
          </div>
          <InquiryForm variant="home" />
        </div>
      </section>
    </>
  );
}
