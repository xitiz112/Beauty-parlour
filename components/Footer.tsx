import Link from "next/link";
import type { StudioSetting } from "@prisma/client";

export function Footer({ studio }: { studio: StudioSetting }) {
  return (
    <footer className="site-footer" id="site-footer">
      <div className="container footer-brand">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-wordmark" aria-label={`${studio.name} beauty studio`}>
              <span className="logo-mark">{studio.shortName}</span>
              <span className="logo-sub">Beauty Studio</span>
            </div>
            <p>{studio.tagline}</p>
          </div>
          <div className="footer-col">
            <strong>Visit</strong>
            <div className="footer-contact-item">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              <p>{studio.address}<br />{studio.city}</p>
            </div>
            <div className="footer-contact-item">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6.6 3.8c.3-.7 1.1-1.1 1.8-.9l2.2.6c.6.2 1 .7 1.1 1.4l.4 2.4c.1.6-.2 1.2-.7 1.5l-1.3.9a12.6 12.6 0 0 0 5.2 5.2l.9-1.3c.3-.5.9-.8 1.5-.7l2.4.4c.7.1 1.2.5 1.4 1.1l.6 2.2c.2.7-.2 1.5-.9 1.8l-1.6.7c-.8.3-1.6.4-2.4.2C10.2 18.6 5.4 13.8 4.7 7.8c-.2-.8-.1-1.6.2-2.4l.7-1.6Z" />
              </svg>
              <p><a href={studio.phoneHref}>{studio.phone}</a><br /><a href={studio.whatsappHref}>WhatsApp</a></p>
            </div>
          </div>
          <div className="footer-col">
            <strong>Explore</strong>
            <div className="footer-links">
              <Link href="/#services">Services</Link>
              <Link href="/#bridal">Bridal</Link>
              <Link href="/#gallery">Gallery</Link>
              <Link href="/#contact">Request appointment</Link>
            </div>
          </div>
          <div className="footer-col">
            <strong>Follow us</strong>
            <div className="footer-links">
              <a href={studio.instagramHref} target="_blank" rel="noreferrer">Instagram</a>
              <a href={studio.facebookHref} target="_blank" rel="noreferrer">Facebook</a>
            </div>
          </div>
        </div>
        <div className="footer-legal">
          <span>© {new Date().getFullYear()} {studio.name}. All rights reserved.</span>
          <nav aria-label="Legal">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/cancellation">Terms of Service</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
