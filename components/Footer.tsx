import Link from "next/link";
import { Camera, MapPin, MessageCircle, Music2, Phone, Share2 } from "lucide-react";
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
              <MapPin aria-hidden="true" />
              <p>{studio.address}<br />{studio.city}</p>
            </div>
            <div className="footer-contact-item">
              <Phone aria-hidden="true" />
              <p><a href={studio.phoneHref}>{studio.phone}</a><br /><a href={studio.whatsappHref}>WhatsApp</a></p>
            </div>
          </div>
          <div className="footer-col">
            <strong>Explore</strong>
            <div className="footer-links">
              <Link href="/#services">Our Menu</Link>
              <Link href="/#signature">Packages</Link>
              <Link href="/#contact">Availability</Link>
              <Link href="/#gallery">Gallery</Link>
              <Link href="/#contact">Request appointment</Link>
            </div>
          </div>
          <div className="footer-col">
            <strong>Follow us</strong>
            <div className="footer-socials">
              <a href={studio.instagramHref} target="_blank" rel="noreferrer" aria-label="Instagram">
                <Camera aria-hidden="true" />
              </a>
              <a href={studio.facebookHref} target="_blank" rel="noreferrer" aria-label="Facebook">
                <Share2 aria-hidden="true" />
              </a>
              <a href="https://www.tiktok.com/@liorastudio.np" target="_blank" rel="noreferrer" aria-label="TikTok">
                <Music2 aria-hidden="true" />
              </a>
              <a href={studio.whatsappHref} target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <MessageCircle aria-hidden="true" />
              </a>
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
