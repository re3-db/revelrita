import Stars from "@/components/Stars";
import { reviewsBy } from "@/lib/reviews";
import { delay } from "@/lib/site";

/** A static row of three review cards (used on the events page). */
export default function ReviewCards({ names }: { names: string[] }) {
  return (
    <div className="steps mt-[34px]">
      {reviewsBy(...names).map((r, i) => (
        <figure key={r.name} className="step reveal m-0" style={delay(i * 110)}>
          <Stars />
          <p className="text-[18px]">{r.quote}</p>
          <figcaption className="font-sans font-semibold text-[14px] text-muted pt-[14px]">{r.name}</figcaption>
        </figure>
      ))}
    </div>
  );
}
