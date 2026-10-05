export type Review = { quote: string; name: string };

// Newest first.
export const reviews: Review[] = [
  { quote: "Revelrita is the BEST! We got to bring her to our wedding out in Pauma Valley. It was a little orange farm so as you could imagine, the blue Revelrita cart went perfect with the venue. Made our cocktail hour and dinner portion so fun. Vibes were had. Will always recommend Revelrita and Helen for your next event!", name: "Joy Park" },
  { quote: "Revelrita was an 11/10 experience for me. From the initial process booking and working with Helen on the drink menu, to the bartending at the party and all the way to cleanup it couldn't have gone better. It was a hit amongst our guests and her service/skills were 10/10 as well. You'd be a fool not to book Revelrita!", name: "Grace Kelly" },
  { quote: "A vibe you won't want to pass up!! Incredible all around. 10/10", name: "Tori Hensley" },
  { quote: "If you're looking to elevate any party or gathering in San Diego, Revelrita is an absolute MUST-HAVE. From the second they set up, everyone was obsessed with the aesthetic—it is beyond cute, super stylish, and makes for the absolute best photo backdrop! But as amazing as it looks, the real stars of the show are the drinks and the service. The bartender was hands-down the most fun, friendly, and energetic person ever, keeping the vibes high and making everyone feel so welcomed. And the drinks? So yummy, incredibly fresh, and crafted to perfection! Revelrita truly brings the ultimate party experience right to you. I can't recommend them enough—10/10.", name: "Lauren Streufert" },
  { quote: "Helen is incredible to work with and helps make an event memorable… not to mention the good vibes, tasty drinks and ENERGY that come with the booking! If you want to level up a party, look no further than Revelrita.", name: "Blake Fol" },
  { quote: "Best drinks, best bartenders, best vibes. All my guests raved about Revelrita, we will be using Helen for all our events from here on out!", name: "Grace Reardon" },
  { quote: "100/10! I've now been at 4 events with Revelrita and it just brings the VIBES. Helen and her team are so fun and create the cutest, themed menu for the drinks. Drinks are actually good, elevated, have cute little garnishes, and are in classy cups. My fav one has been the charcoal marg. I'd say I like drinking a little to fair amount but my feet just find their way back in line getting another - lol! We think of Revelrita for all our work holiday parties, engagements, etc. Honestly just find excuses to bring back Helen + the Revelrita trailer whenever we can. Amazing return on fun, value, and cuteness for what she has us pay!", name: "Camryn Jones" },
  { quote: "Incredible bar that added a fun touch to our party! Bartender Kelly was amazing - service with a smile! Helen and Dave were a joy to work with in getting the bar set up - everyone loved it!! 10/10 highly recommend - thank you!!", name: "Carey Cimino" },
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
