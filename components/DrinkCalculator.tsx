"use client";

import { useState } from "react";
import { delay } from "@/lib/site";

const paces = [
  { value: 0.75, label: "Light" },
  { value: 1, label: "Average" },
  { value: 1.3, label: "Thirsty" },
];

const mixFields = [
  { key: "beer", id: "cBeer", label: "Beer & seltzer" },
  { key: "wine", id: "cWine", label: "Wine" },
  { key: "bub", id: "cBub", label: "Bubbly" },
  { key: "cock", id: "cCock", label: "Cocktails" },
] as const;

type MixKey = (typeof mixFields)[number]["key"];

const num = (v: string) => Math.max(0, Number(v) || 0);

export default function DrinkCalculator() {
  const [guests, setGuests] = useState("100");
  const [hours, setHours] = useState("4");
  const [pace, setPace] = useState(1);
  const [mix, setMix] = useState<Record<MixKey, string>>({ beer: "40", wine: "30", bub: "10", cock: "20" });

  const g = Math.max(1, num(guests));
  const h = Math.max(1, num(hours));
  const pct = { beer: num(mix.beer), wine: num(mix.wine), bub: num(mix.bub), cock: num(mix.cock) };
  const total = pct.beer + pct.wine + pct.bub + pct.cock;
  const sum = total || 1;

  /* averaged across ALL guests, non-drinkers included:
     1 drink the first hour, 0.6 an hour through hour 4, 0.4 an hour after that */
  const perGuest = 1 + 0.6 * Math.min(Math.max(h - 1, 0), 3) + 0.4 * Math.max(h - 4, 0);
  const drinks = Math.round(g * perGuest * pace);
  const share = (k: MixKey) => (drinks * pct[k]) / sum;

  const beer = Math.ceil(share("beer")); /* one can per drink */
  const wine = Math.ceil(share("wine") / 5); /* five 5 oz glasses a bottle */
  const bub = Math.ceil(share("bub") / 6); /* six flutes a bottle */
  const cock = Math.ceil(share("cock") / 16); /* 1.5 oz pours, about 16 per 750 ml */

  return (
    <>
      <div className="card reveal bg-paper">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="cGuests">Number of guests</label>
            <input id="cGuests" type="number" min="1" max="2000" value={guests} onChange={(e) => setGuests(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="cHours">Hours of service</label>
            <input id="cHours" type="number" min="1" max="12" value={hours} onChange={(e) => setHours(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>How does this crowd drink?</label>
          <div className="choices">
            {paces.map((p) => (
              <label className="choice" key={p.label}>
                <input
                  type="radio"
                  name="pace"
                  value={p.value}
                  checked={pace === p.value}
                  onChange={() => setPace(p.value)}
                />
                <span>{p.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="field mt-[8px]">
          <div className="flex justify-between items-baseline gap-[16px]">
            <label className="m-0">The mix</label>
            <span className={`font-sans text-[14px] font-bold ${total === 100 ? "text-muted" : "text-ember"}`}>
              {total}% of 100
            </span>
          </div>
          <div className="mixgrid">
            {mixFields.map((f) => (
              <div key={f.key}>
                <label htmlFor={f.id} className="font-semibold">
                  {f.label}
                </label>
                <input
                  id={f.id}
                  type="number"
                  min="0"
                  max="100"
                  value={mix[f.key]}
                  onChange={(e) => setMix({ ...mix, [f.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="results reveal" style={delay(90)}>
        <div className="res">
          <span className="rlabel">Beer &amp; seltzer</span>
          <span className="rnum">{beer}</span>
          <span className="runit">{beer === 1 ? "can" : "cans"}</span>
        </div>
        <div className="res">
          <span className="rlabel">Wine</span>
          <span className="rnum">{wine}</span>
          <span className="runit">bottles</span>
        </div>
        <div className="res">
          <span className="rlabel">Bubbly</span>
          <span className="rnum">{bub}</span>
          <span className="runit">bottles</span>
        </div>
        <div className="res">
          <span className="rlabel">Cocktails</span>
          <span className="rnum">{cock}</span>
          <span className="runit">bottles of spirit</span>
        </div>
      </div>

      <p className="center reveal mt-[20px] text-muted">
        That works out to about <strong>{drinks}</strong> drinks across the night, including{" "}
        <strong>{Math.round(share("cock"))}</strong> cocktails.
      </p>
    </>
  );
}
