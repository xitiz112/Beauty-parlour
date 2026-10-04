import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import type { NavLink, StudioSetting } from "@prisma/client";
import type { LayoutContent } from "@/lib/data";
import { SocialIcon } from "./SocialIcons";

function FooterLink({ link }: { link: NavLink }) {
  return (
    <Link
      href={link.href}
      target={link.newTab ? "_blank" : undefined}
      rel={link.newTab ? "noopener noreferrer" : undefined}
      data-book={link.opensBooking || undefined}
    >
      {link.label}
    </Link>
  );
}

export function Footer({ studio, content }: { studio: StudioSetting; content: LayoutContent }) {
  return (
    <footer className="site-footer" id="site-footer">
      <div className="container footer-brand">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-wordmark" aria-label={`${studio.name} ${studio.logoSubtitle}`}>
              <span className="logo-mark">{studio.shortName}</span>
              <span className="logo-sub">{studio.logoSubtitle}</span>
            </div>
            <p>{studio.tagline}</p>
          </div>
          <div className="footer-col">
            <strong>{studio.footerVisitTitle}</strong>
            <div className="footer-contact-item">
              <MapPin aria-hidden="true" />
              <p>{studio.address}<br />{studio.city}</p>
            </div>
            <div className="footer-contact-item">
              <Phone aria-hidden="true" />
              <p><a href={studio.phoneHref}>{studio.phone}</a><br /><a href={studio.whatsappHref} target="_blank" rel="noopener noreferrer">WhatsApp: {studio.whatsapp}</a></p>
            </div>
          </div>
          {content.exploreLinks.length ? (
            <div className="footer-col">
              <strong>{studio.footerExploreTitle}</strong>
              <div className="footer-links">
                {content.exploreLinks.map((link) => (
                  <FooterLink key={link.id} link={link} />
                ))}
              </div>
            </div>
          ) : null}
          {content.socialLinks.length ? (
            <div className="footer-col">
              <strong>{studio.footerSocialTitle}</strong>
              <div className="footer-socials">
                {content.socialLinks.map((social) => (
                  <a key={social.id} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                    <SocialIcon platform={social.platform} />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <div className="footer-legal">
          <span>© {new Date().getFullYear()} {studio.name}. {studio.copyrightText}</span>
          {content.legalLinks.length ? (
            <nav aria-label="Legal">
              {content.legalLinks.map((link) => (
                <FooterLink key={link.id} link={link} />
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
