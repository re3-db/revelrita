export type Review = { quote: string; name: string };

export const reviews: Review[] = [
  { quote: "I'd rebook for Helen's energy alone. PERIOD. She's the best in the biz.", name: "Anne Gaskins" },
  { quote: "This is not your regular bar cart experience. It is creative, fun, and full of happy energy.", name: "Reigha Tencer" },
  { quote: "After just one booking, Revelrita earned a permanent spot on our office's coveted Repeat List.", name: "S. M." },
  { quote: "Helen took all the thinking out of having both alcoholic and non-alcoholic drinks at my event. I didn't have to stress about a thing.", name: "Hanna Lee Hernandez" },
  { quote: "The most delicious drinks served by the friendliest people. They add to the vibe and the no wait is perfect.", name: "Maryellen Schultz" },
  { quote: "Served 75+ people and added great vibes to the party. 10/10 would recommend for anyone throwing an outdoor work event.", name: "Corey Schrimpl" },
  { quote: "Revelrita brings the party wherever they go. So much fun energy, good drinks, and good times.", name: "Luke Roh" },
  { quote: "Helen works with you to create unique and fun drinks, and it made it so much more enjoyable to host a large party.", name: "Tony & Yvette Pederson" },
  { quote: "Hired them for my engagement party with 100+ people and they were such rock stars. Drinks were amazing.", name: "Emily Ferris" },
  { quote: "Delicious and unique cocktail options, and the team's energy was the life of the party.", name: "Claire B." },
  { quote: "Helen is so dialed. Revelrita is your go-to mobile bartending service for your next event.", name: "Cole Suiste" },
  { quote: "Showed up with music, energy, and delicious cocktails. Easy to book and friendly bartenders.", name: "Sophia Pruett" },
];

export function reviewsBy(...names: string[]) {
  return names.map((name) => {
    const review = reviews.find((r) => r.name === name);
    if (!review) throw new Error(`No review from ${name}`);
    return review;
  });
}
