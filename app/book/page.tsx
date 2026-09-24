import type { Metadata } from "next";
import ContactLinks from "@/components/ContactLinks";
import InquiryForm from "@/components/InquiryForm";
import { delay } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book the cart",
  description:
    "Check your date with Revelrita. Tell us your date, guest count and what you're thinking for drinks and we'll come back with availability and menu ideas.",
};

export default function BookPage() {
  return (
    <>
      <section className="subhero bg-peach">
        <div className="wrap duo">
          <div className="reveal">
            <p className="eyebrow text-ink">Book the cart</p>
            <h1 className="mt-[16px]">Let&apos;s make it a party.</h1>
            <p className="lede text-ink">
              Tell me the date and a little about your people. I&apos;ll come back with availability and a couple of ideas
              for the bar.
            </p>
            <ContactLinks className="mt-[22px]" />
          </div>
          <InquiryForm variant="book" />
        </div>
      </section>

      <section className="pad">
        <div className="wrap">
          <h2 className="big center reveal">What happens next</h2>
          <div className="steps">
            <div className="step reveal">
              <p className="num">01</p>
              <h3>I write back</h3>
              <p>With availability for your date and a couple of menu ideas based on what you told me.</p>
            </div>
            <div className="step reveal" style={delay(110)}>
              <p className="num">02</p>
              <h3>We lock the menu</h3>
              <p>Then I send the shopping list for your alcohol, down to the bottle, so there is no guesswork.</p>
            </div>
            <div className="step reveal" style={delay(220)}>
              <p className="num">03</p>
              <h3>We pull up and pour</h3>
              <p>We arrive early, set up, work your timeline, and pack out clean.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
