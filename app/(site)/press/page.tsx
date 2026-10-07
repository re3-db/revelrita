import type { Metadata } from "next";
import PressCards from "@/components/PressCards";

export const metadata: Metadata = {
  title: "Press",
  description:
    "Interviews and articles featuring Helen Bowman and Revelrita, the mobile bar cart in Cardiff, CA, from SDVoyager, CanvasRebel and Bold Journey.",
  alternates: { canonical: "/press" },
};

export default function PressPage() {
  return (
    <section className="subhero">
      <div className="wrap">
        <div className="reveal">
          <p className="eyebrow">Press</p>
          <h1 className="mt-[16px]">Read all about it.</h1>
          <p className="lede">Interviews and features on Helen and the cart.</p>
        </div>
        <PressCards />
      </div>
    </section>
  );
}
