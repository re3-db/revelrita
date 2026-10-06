import { press } from "@/lib/press";
import { delay } from "@/lib/site";

/** A card per article in lib/press.ts, each opening the article in a new tab. */
export default function PressCards() {
  return (
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
  );
}
