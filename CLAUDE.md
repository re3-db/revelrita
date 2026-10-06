@AGENTS.md

# Revelrita

Marketing site for Revelrita, Helen's mobile bar cart business in Cardiff, CA (revelrita.com).
Next.js 16 App Router + Tailwind v4, deployed on Vercel. Every page is static except the
inquiry form's server action.

This site was converted from a single-file HTML design (`_source/revelrita-site.html`, gitignored,
not deployed). The design must stay visually identical to it: when in doubt, match the original.

## Commands

- `npm run dev` for local dev on http://localhost:3000
- `npm run build` for a production build (also type-checks)
- `npm run lint` runs ESLint

Run `npm run build && npm run lint` before committing.

## Layout

- `app/` has one folder per page: `/` (home), `/events`, `/cart`, `/packages`, `/calculator`,
  `/gallery`, `/press`, `/faq`, `/book`. Each page sets its own `metadata` (title uses the
  `"%s | Revelrita"` template from `app/layout.tsx`).
- `app/actions.ts` is the `sendInquiry` server action behind both "Check your date" forms.
- `components/` holds shared pieces: `Nav` (sticky nav + full-screen menu), `Footer`,
  `ReviewCarousel` / `ReviewCards` / `Stars`, `InquiryForm` (`variant="home" | "book"`),
  `DatePicker` (the form's calendar, with a "several possible dates" mode), `PressCards`, `JsonLd`, `HeroSlides`,
  `DrinkCalculator`, `ContactLinks`, `RevealObserver`.
- `lib/site.ts` has contact details, the page list (drives the menu), and `delay()`.
- `lib/reviews.ts` has every review. Add new ones here and both review sections pick them up.
- `lib/press.ts` has every article/interview featuring Revelrita (newest first). `PressCards` renders
  them on `/press` and in the home page "In the press" section (`#press`).
- `lib/images.ts` re-exports every photo in `public/images/` as a static import.

## Styling rules

- Her CSS lives in `app/globals.css` inside `@layer components`, copied from the original
  unchanged (lines marked `port:` are the only edits). The class names (`.btn`, `.pad`, `.wrap`,
  `.duo`, `.steps`, `.card`, `.eyebrow`, `.lede`, `h2.big`, ...) are the design system. Reuse them.
- Tailwind is imported **without preflight** on purpose, so browser defaults match the original.
  Don't switch to a plain `@import "tailwindcss"`, because the reset would shift spacing and headings.
- Use Tailwind utilities for one-off tweaks (what used to be inline `style=""`), e.g.
  `mt-[14px]`, `text-muted`, `bg-sky`. Utilities override the component layer.
- Colors: only her palette exists as Tailwind colors: `cream ink deep orange ember peach blush sky
  muted paper white`. They map to the CSS variables in `:root`, so change a color there, once.
- Fonts: Bricolage Grotesque (`font-sans`, headings/UI), Newsreader (`font-serif`, body),
  Instrument Serif (`font-fancy`, the italic accents in headlines). They load through the Google
  Fonts `<link>` in `app/layout.tsx`, exactly as in the original. Don't swap to `next/font`
  without comparing side by side: the original only loads weights 400/600/800, so CSS `700`
  renders as 800, and a variable font would change that.

## SEO

- Each page's `metadata` sets `alternates: { canonical: "/route" }`. Add one to every new page.
- `app/sitemap.ts` lists every entry in `pages` (`lib/site.ts`); `app/robots.ts` allows all and points to it.
- `lib/schema.ts` is the schema.org `LocalBusiness` JSON-LD rendered on every page (via `JsonLd` in the
  root layout). It pulls contact details from `lib/site.ts` and articles from `lib/press.ts`.
- `/faq` also renders `FAQPage` JSON-LD from its `faqs` list. Answers that contain JSX need a plain `text`.

## Images

- Put new photos in `public/images/` (kebab-case), export them from `lib/images.ts`, and render
  them with `next/image` using the static import (gives real width/height). Always pass a `sizes`
  that matches the CSS layout, or phones will download desktop-sized files.
- Use `preload` (not the deprecated `priority`) only for the above-the-fold hero image and logo.

## Motion

- Add `className="reveal"` to fade an element up on scroll. Stagger siblings with
  `style={delay(110)}` (sets the `--d` CSS variable). `RevealObserver` in the layout handles it,
  including after client-side navigation.

## Inquiry emails

Both forms call `sendInquiry` (`app/actions.ts`), which posts to the Resend REST API (no SDK).
The visitor gets a branded HTML confirmation (`lib/inquiry-email.ts`: thank-you note plus a copy of
their answers) from `fun@revelrita.com`. Helen gets the same email as a separate message from
`website@revelrita.com` (reply-to the visitor, with a note on top). It is not a BCC on purpose: Gmail
files mail "from" your own address under Sent, so a BCC from fun@ never reaches the fun@ inbox.
If the visitor's confirmation fails, Helen's copy says so.
The email logo is `public/email/logo.png`, loaded from `https://revelrita.com/email/logo.png`.

revelrita.com must be verified in Resend (Domains, DNS records at the domain host). Resend refuses to
send to anyone but the account owner until it is.

Env vars (see `.env.example`; set them in Vercel for Production and Preview):
- `RESEND_API_KEY` (required). Without it the form shows a friendly error and logs the inquiry.
- `INQUIRY_FROM` (optional, default `Revelrita <fun@revelrita.com>`): the visitor's confirmation.
- `INQUIRY_TO` (optional, default `fun@revelrita.com`): where Helen's copy goes.
- `INQUIRY_NOTIFY_FROM` (optional, default `Revelrita website <website@revelrita.com>`): Helen's copy.

The form has a hidden `company` honeypot field. If a bot fills it, the action returns success without sending.

## Deploying

Vercel builds from `main` automatically. No `vercel.json` is needed.
