import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import * as img from "@/lib/images";
import { delay } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos of the Revelrita bar cart at recent weddings, backyard parties and pop-ups around San Diego.",
  alternates: { canonical: "/gallery" },
};

const photos = [
  { src: img.cartNight, alt: "The cart lit up at night with guests at the window" },
  { src: img.guestsBarWindow, alt: "Two guests leaning into the bar window" },
  { src: img.drinksMenuFrame, alt: "A printed drinks menu in a brass frame" },
  { src: img.friendsBackyard, alt: "Four friends with drinks at a backyard party" },
  { src: img.cartGardenDusk, alt: "The cart parked in a garden at dusk" },
  { src: img.friendsGoldenHour, alt: "Three friends with drinks at golden hour" },
  { src: img.campChairs, alt: "Guests walking in with camp chairs" },
  { src: img.litSignGuests, alt: "Two guests in front of the lit revelrita sign" },
  { src: img.campChairsLaughing, alt: "Two guests laughing in camp chairs" },
  { src: img.coupleCart, alt: "A couple posing in front of the cart" },
  { src: img.friendsGrass, alt: "Three friends with drinks on the grass" },
  { src: img.pinkSunsetGuests, alt: "Guests around the cart under a pink sunset sky" },
  { src: img.cartLawnGuests, alt: "The cart on a lawn with guests ordering drinks" },
  { src: img.friendsMargaritasGoldenHour, alt: "Three friends holding margaritas" },
  { src: img.barTopMenu, alt: "The live edge bar top with bottles and a menu" },
  { src: img.crowdBackyard, alt: "A crowd with drinks around the cart in a backyard" },
  { src: img.guestLaughing, alt: "A guest laughing and raising a drink" },
  { src: img.guestsAtBar, alt: "Guests leaning on the bar top talking to the bartender" },
  { src: img.bottlesDrinkware, alt: "Bottles and drinkware set out on a bar table" },
  { src: img.cartSunset, alt: "The cart at a party under a sunset sky" },
  { src: img.helen, alt: "Helen standing beside the bar cart" },
  { src: img.margaritasBarTop, alt: "Two pink margaritas with dried lime wheels on the bar top" },
  { src: img.windowMenuFlowers, alt: "The cart window with the cocktail menu and fresh flowers" },
  { src: img.beersCheers, alt: "A guest and bartender cheersing with beers at the window" },
  { src: img.friendsHuggingSign, alt: "Two friends hugging in front of the revelrita sign" },
  { src: img.margaritasCheers, alt: "Three pink margaritas raised for a cheers" },
  { src: img.friendsCartWindow, alt: "Three friends laughing beside the cart window" },
  { src: img.margaritaRaised, alt: "A guest raising a pink margarita against the cart" },
  { src: img.margaritasAbove, alt: "Hands holding pink margaritas from above" },
  { src: img.stringLights, alt: "Two friends with drinks under the string lights" },
];

/* The reveal stagger restarted a couple of times in the original list; kept as-is */
const stagger = [0, 70, 140, 0, 70, 140, 0, 70, 140, 0, 70, 0, 70, 140, 0, 70, 140, 0, 70, 140, 0, 70, 140, 0, 70, 140, 0, 70, 140, 0];

export default function GalleryPage() {
  return (
    <>
      <section className="subhero pb-0">
        <div className="wrap center reveal">
          <p className="eyebrow">Gallery</p>
          <h1 className="mx-auto mb-0 mt-[16px]">Some recent parties.</h1>
        </div>
      </section>

      <section className="pad">
        <div className="wrap">
          <div className="masonry">
            {photos.map((p, i) => (
              <figure key={p.alt} className="reveal" style={delay(stagger[i])}>
                <Image src={p.src} alt={p.alt} sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw" />
              </figure>
            ))}
          </div>
          <div className="center mt-[44px]">
            <Link className="btn reveal" href="/book">
              Check your date
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
