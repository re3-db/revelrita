import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { barTopMenu, cart, cartLawnGuests, cartSunset, crowdBackyard } from "@/lib/images";
import { delay } from "@/lib/site";

export const metadata: Metadata = {
  title: "The cart",
  description:
    "Meet the Revelrita bar cart: a restored sky blue pony trailer with a live edge bar top, pebble ice, fresh juice and a commercial sound system.",
  alternates: { canonical: "/cart" },
};

export default function CartPage() {
  return (
    <>
      <section className="subhero">
        <div className="wrap center reveal">
          <p className="eyebrow">The cart</p>
          <h1 className="mx-auto mb-0 mt-[16px]">A pony trailer that grew up into a bar.</h1>
          <p className="lede mx-auto mb-0 mt-[14px]">
            Restored, painted sky blue, topped with live edge wood. It is usually the first thing your guests photograph
            and the last place they want to leave.
          </p>
        </div>
        <div className="wrap mt-[20px]">
          <Image
            className="reveal w-[min(100%,820px)] mx-auto block"
            style={delay(100)}
            src={cart}
            alt="The Revelrita bar cart, a restored sky blue horse trailer"
            sizes="(max-width: 860px) 100vw, 820px"
          />
        </div>
      </section>

      <section className="pad pt-0">
        <div className="wrap duo">
          <div className="reveal">
            <h2 className="big">The specifics</h2>
            <ul className="speclist">
              <li>
                <span>Size</span>
                <span>67&quot; wide &times; 143&quot; long</span>
              </li>
              <li>
                <span>Bar top</span>
                <span>Live edge wood</span>
              </li>
              <li>
                <span>Getting there</span>
                <span>Towed in and parked by us</span>
              </li>
              <li>
                <span>Power</span>
                <span>Needs to park near an outlet</span>
              </li>
            </ul>
            <p className="text-muted mt-[22px]">
              Ice, sound, signage and the rest of the extras live on the{" "}
              <Link href="/packages" className="text-ember font-semibold">
                packages
              </Link>{" "}
              page.
            </p>
          </div>
          <div className="reveal" style={delay(120)}>
            <Image className="tall" src={cartSunset} alt="The cart at a party under a sunset sky" sizes="(max-width: 1000px) 100vw, 50vw" />
          </div>
        </div>
      </section>

      <section className="deep pad">
        <div className="wrap">
          <h2 className="big reveal">Inside it</h2>
          <div className="cols">
            <div className="reveal">
              <h3>Real ingredients</h3>
              <p>Fresh juice, herbs, dried citrus and good garnishes. Nothing out of a plastic jug.</p>
            </div>
            <div className="reveal" style={delay(110)}>
              <h3>Proper ice</h3>
              <p>Pebble ice for the long drinks, whiskey blocks for the short ones. It matters more than people think.</p>
            </div>
            <div className="reveal" style={delay(220)}>
              <h3>Music</h3>
              <p>A commercial sound system comes with the cart, so the bar is also where the party sounds best.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pad">
        <div className="wrap">
          <h2 className="big reveal">Out in the wild</h2>
          <div className="gal">
            <Image className="reveal" src={cartLawnGuests} alt="The cart set up on a lawn with guests ordering" sizes="(max-width: 1000px) 50vw, 33vw" />
            <Image className="reveal" style={delay(90)} src={crowdBackyard} alt="A crowd around the cart in a backyard" sizes="(max-width: 1000px) 50vw, 33vw" />
            <Image className="reveal" style={delay(180)} src={barTopMenu} alt="The live edge bar top with bottles and a menu" sizes="(max-width: 1000px) 50vw, 33vw" />
          </div>
          <div className="center mt-[36px]">
            <Link className="btn reveal" href="/book">
              Check your date
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
