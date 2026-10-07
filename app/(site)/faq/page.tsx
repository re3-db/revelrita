import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "How the alcohol works, what's included, how far we travel, insurance and how to book the Revelrita bar cart.",
  alternates: { canonical: "/faq" },
};

const packagesLink = (
  <Link href="/packages" className="text-ember font-semibold">
    packages page
  </Link>
);

// `text` is the plain-text answer for structured data, needed when `a` contains links
const faqs: { q: string; a: React.ReactNode; text?: string }[] = [
  {
    q: "How does the alcohol work?",
    a: "You buy it. We build the shopping list down to the bottle based on your guest count and menu, you pay liquor store prices with nothing marked up, and anything unopened goes home with you. We are not licensed to buy alcohol on your behalf, so it goes on your card at checkout, or you log into our Total Wine account and we handle the rest.",
  },
  {
    q: "So what am I paying you for?",
    a: "Two invoices, no mystery: your alcohol, and our service fee. The service fee covers the cart, the ice, the drinkware, the mixers and garnishes, the setup and breakdown, and the bartenders.",
  },
  {
    q: "What is actually included?",
    a: (
      <>
        The cart, the bartenders, a custom menu, ice and drinkware, garnish, lemon water, setup and breakdown, and
        liability coverage. The full list, along with everything you can add on, is on the {packagesLink}.
      </>
    ),
    text: "The cart, the bartenders, a custom menu, ice and drinkware, garnish, lemon water, setup and breakdown, and liability coverage. The full list, along with everything you can add on, is on the packages page at revelrita.com/packages.",
  },
  {
    q: "How far do you travel?",
    a: "All over San Diego County, and somewhat beyond. Cardiff, Encinitas, Leucadia, Solana Beach, Del Mar and Carlsbad are home turf. If you are further out, ask anyway.",
  },
  {
    q: "What if the cart will not fit at my venue?",
    a: "Then we bring a smaller bar instead, set up in the same colors with the same drinks. Tell us the venue early and we will tell you which one you are getting.",
  },
  {
    q: "Can you do non-alcoholic drinks?",
    a: "Yes. Mocktails can be the whole menu or sit alongside the cocktails so nobody is holding a plastic cup of water.",
  },
  {
    q: "How many guests can you handle?",
    a: "We have poured for parties of every size, including events north of 250 people and engagement parties just under 30. Tell us your headcount and we will staff to it.",
  },
  {
    q: "What does it cost?",
    a: (
      <>
        Every event is quoted on its own, because the number moves with your guest count, how long we pour and how many
        bartenders you need. Have a look at the {packagesLink} to see what is included, then send over your date and we
        will put a number to it.
      </>
    ),
    text: "Every event is quoted on its own, because the number moves with your guest count, how long we pour and how many bartenders you need. See revelrita.com/packages for what is included, then send over your date at revelrita.com/book and we will put a number to it.",
  },
  {
    q: "Are you insured?",
    a: "Yes. Revelrita carries commercial general liability with $1,000,000 per occurrence and a $2,000,000 aggregate, plus $100,000 for premises rented to us and $5,000 in medical expense. If your venue needs a certificate of insurance, or needs to be named as an additional insured, send us their details and we will have it sent over at no cost to you.",
  },
  {
    q: "How do I book?",
    a: "Send over your date, venue, guest count and what you are thinking for drinks. We come back with availability and a couple of menu ideas, then hold the date once you say go.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: typeof f.a === "string" ? f.a : f.text },
  })),
};

export default function FaqPage() {
  return (
    <section className="subhero">
      <JsonLd data={faqSchema} />
      <div className="wrap center reveal">
        <h1 className="mx-auto my-0">Frequently asked questions.</h1>
      </div>
      <div className="wrap faq">
        {faqs.map((f, i) => (
          <details key={f.q} className="reveal" open={i === 0}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
      <div className="wrap center mt-[44px]">
        <Link className="btn reveal" href="/book">
          Check your date
        </Link>
      </div>
    </section>
  );
}
