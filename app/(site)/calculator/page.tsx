import type { Metadata } from "next";
import Link from "next/link";
import DrinkCalculator from "@/components/DrinkCalculator";
import { delay } from "@/lib/site";

export const metadata: Metadata = {
  title: "Drink calculator",
  description:
    "How much alcohol do you need for your party? Enter your guest count and hours to get a rough count of beer, wine, bubbly and spirits.",
  alternates: { canonical: "/calculator" },
};

export default function CalculatorPage() {
  return (
    <>
      <section className="subhero pb-[clamp(20px,3vw,40px)]">
        <div className="wrap center reveal">
          <p className="eyebrow">Free tool</p>
          <h1 className="mx-auto mb-0 mt-[16px]">How much booze do you actually need?</h1>
          <p className="lede mx-auto mb-0 mt-[14px]">
            Tell it your headcount and how long you&apos;re pouring. It works out roughly what to put in the cart, in
            bottles and cans you can buy at the store.
          </p>
        </div>
      </section>

      <section className="pad pt-[clamp(20px,3vw,36px)]">
        <div className="wrap">
          <DrinkCalculator />

          <div className="card reveal bg-sky mt-[36px] text-center" style={delay(120)}>
            <h2 className="big text-[clamp(24px,2.8vw,36px)]">This is a starting point, not a shopping list.</h2>
            <p className="mx-auto mb-0 mt-[12px] max-w-[56ch]">
              Book us and you get the real one: every bottle, sized to your menu and your crowd, so you buy once and bring
              the leftovers home sealed.
            </p>
            <Link className="btn mt-[22px]" href="/book">
              Check your date
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
