import { contact } from "@/lib/site";

/** The big email + phone pair beside both inquiry forms. */
export default function ContactLinks({ className }: { className: string }) {
  const link = "font-sans font-semibold text-[21px] no-underline";
  return (
    <p className={className}>
      <a href={`mailto:${contact.email}`} className={link}>
        {contact.email}
      </a>
      <br />
      <a href={contact.phoneHref} className={link}>
        {contact.phone}
      </a>
    </p>
  );
}
