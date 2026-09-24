import Image from "next/image";
import Link from "next/link";
import { logoOrange } from "@/lib/images";
import { contact } from "@/lib/site";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-top">
          <Link href="/" aria-label="Revelrita home">
            <Image src={logoOrange} alt="Revelrita" sizes="300px" />
          </Link>
          <div className="foot-links">
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            <a href={contact.phoneHref}>{contact.phone}</a>
            <a href={contact.instagramHref}>{contact.instagram}</a>
            <Link href="/book">Book the cart</Link>
          </div>
        </div>
        <div className="foot-bottom">
          <span>Cardiff, California</span>
          <span>Encinitas / Leucadia / Del Mar / Solana Beach / Carlsbad</span>
        </div>
      </div>
    </footer>
  );
}
