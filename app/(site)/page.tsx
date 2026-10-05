import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Clock3, MapPin, Minus, Phone, Plus } from "lucide-react";
import { ContactBookingForm } from "@/components/ContactBookingForm";
import { GalleryGrid } from "@/components/GalleryGrid";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ReviewCarousel } from "@/components/ReviewCarousel";
import { ServiceMenu } from "@/components/ServiceMenu";
import { SlideDown } from "@/components/SlideDown";
import { TeamCarousel } from "@/components/TeamCarousel";
import type { SectionContent } from "@prisma/client";
import { getPublicCatalog } from "@/lib/data";
import { formatFromPrice } from "@/lib/time";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; treatment?: string; stylist?: string }>;
}) {
  const query = await searchParams;
  const { studio, categories, stylists, reviews, gallery, offer, signatures, instagram, sections, heroSlides, trustItems, ritualPicks } =
    await getPublicCatalog();
  const { hero, services, rituals, signature, about, gallery: gallerySection, team, reviews: reviewsSection, contact, instagram: instagramSection } =
    sections;
  const bookingHref = (categorySlug: string, treatment: string) =>
    `/?category=${encodeURIComponent(categorySlug)}&treatment=${encodeURIComponent(treatment)}#contact`;

  return (
      <main id="main">
        {hero.visible ? (
          <section className="hero" id="home" aria-label="Introduction">
            <HeroCarousel
              slides={
                heroSlides.length
                  ? heroSlides.map((slide) => ({ src: slide.image, alt: slide.alt }))
                  : [{ src: studio.heroImage, alt: studio.name }]
              }
            />
            <div className="hero-copy">
              <h1>{hero.title}</h1>
              {hero.body ? <p>{hero.body}</p> : null}
              <div className="hero-actions">
                {hero.ctaLabel ? (
                  <a className="btn btn-primary" href="#contact" data-book>
                    {hero.ctaLabel}
                  </a>
                ) : null}
                {hero.secondaryCtaLabel ? (
                  <a className="btn btn-ghost" href="#services">
                    {hero.secondaryCtaLabel} <ArrowUpRight className="hero-explore-arrow" aria-hidden="true" size={17} />
                  </a>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {trustItems.length ? (
          <section className="trust" aria-label="Studio facts">
            <div className="container trust-row">
              {trustItems.map((item) => {
                const countable = /^\d+$/.test(item.value);
                return (
                  <div className="trust-item" key={item.id}>
                    <div>
                      <strong>
                        {countable ? <span data-count={item.value}>{item.value}</span> : item.value}
                        {item.suffix === "+" ? (
                          <>
                            <Plus className="trust-plus" aria-hidden="true" />
                            <span className="sr-only">+</span>
                          </>
                        ) : (
                          item.suffix
                        )}
                      </strong>
                      <span className="trust-label">{item.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {services.visible ? (
          <section className="section" id="services">
            <div className="container">
              <SectionHead section={services} />
              <ServiceMenu categories={categories} />
            </div>
          </section>
        ) : null}

        {rituals.visible && ritualPicks.length ? (
          <section className="section ritual-section" id="rituals">
            <div className="container ritual-layout">
              <img className="ritual-image" src={studio.aboutImage} alt={`Warm, softly lit interior of ${studio.name}`} loading="lazy" />
              <div className="ritual-content">
                <div className="ritual-heading">
                  <Eyebrow text={rituals.eyebrow} />
                  <h2>{rituals.title}</h2>
                </div>
                <div className="ritual-list">
                  {ritualPicks.map(({ id, service, note, detail, price }, index) => {
                    const row = (toggle: React.ReactNode) => (
                      <>
                        <span className="ritual-number">{String(index + 1).padStart(2, "0")}</span>
                        <span className="ritual-name">
                          <strong>{service.name}</strong>
                          <small>{note}</small>
                        </span>
                        <span className="ritual-duration">{service.durationMinutes} mins</span>
                        <span className="ritual-price">{formatFromPrice(price ?? service.price).replace("From ", "")}</span>
                        <span className="ritual-toggle" aria-hidden="true">{toggle}</span>
                      </>
                    );
                    return (
                      <SlideDown
                        className={`ritual-item${index === 0 ? " is-featured" : ""}`}
                        triggerClassName="ritual-item-trigger"
                        key={id}
                        trigger={{ closed: row(<Plus />), open: row(<Minus />) }}
                      >
                        <div className="ritual-detail">
                          <p>{detail}</p>
                          <Link className="ritual-book-link" data-book href={bookingHref(service.category.slug, service.name)}>
                            {rituals.ctaLabel || "Book now"} <ArrowRight aria-hidden="true" size={16} />
                          </Link>
                        </div>
                      </SlideDown>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {signature.visible && (signatures.length || offer) ? (
          <section className="section" id="signature">
            <div className="container">
              <SectionHead section={signature} />
              <div className="signature-list">
                {signatures.map((item, index) => {
                  const category = categories.find((entry) => entry.slug === item.categorySlug);
                  const service = category?.services.find((entry) => entry.name === item.treatmentName);
                  const includedServices = item.inclusions.length
                    ? item.inclusions
                    : service?.description
                      ? service.description.split(/,|\band\b/i).map((part) => part.trim()).filter(Boolean)
                      : [service?.name || item.treatmentName, item.story];
                  return (
                    <article className="signature" key={item.id}>
                      <img src={item.image} alt={item.name} loading="lazy" />
                      <div>
                        <span className="sig-num">{String(index + 1).padStart(2, "0")}</span>
                        <h3>{item.name}</h3>
                        <p className="from">{formatFromPrice(item.fromPrice)}</p>
                        <div className="signature-inclusions">
                          <div className="signature-duration">
                            <Clock3 aria-hidden="true" />
                            <span>{service?.durationMinutes ? `${service.durationMinutes} minutes` : "Duration varies"}</span>
                          </div>
                          {signature.details ? <p className="signature-inclusions-title">{signature.details}</p> : null}
                          <ul>
                            {includedServices.map((included, includedIndex) => (
                              <li key={`${item.id}-${includedIndex}`}>
                                <Check aria-hidden="true" />
                                <span>{included}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Link className="btn btn-primary" data-book href={bookingHref(item.categorySlug, item.treatmentName)}>
                          {signature.ctaLabel || "Book now"}
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
              {offer ? (
                <aside className="offer-banner">
                  <div>
                    <p className="eyebrow">{offer.eyebrow}</p>
                    <h3>{offer.title}</h3>
                    <p>{offer.detail}</p>
                  </div>
                  <a className="btn btn-light" href="#contact" data-book>
                    {offer.cta}
                  </a>
                </aside>
              ) : null}
            </div>
          </section>
        ) : null}

        {about.visible ? (
          <section className="section" id="about">
            <div className="container about-split">
              <video
                className="about-video"
                src="/media/studio-video"
                poster={studio.aboutImage}
                aria-label="A relaxing beauty studio treatment"
                controls
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
              <div className="about-copy">
                <Eyebrow text={about.eyebrow} />
                <h2>{about.title}</h2>
                <p>{studio.aboutWords}</p>
                {about.body ? <p>{about.body}</p> : null}
                {about.ctaLabel ? (
                  <Link className="btn btn-primary about-book-cta" href="/#contact" data-book>
                    {about.ctaLabel}
                  </Link>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {gallerySection.visible && gallery.length ? (
          <section className="section" id="gallery">
            <div className="container">
              <SectionHead section={gallerySection} />
              <GalleryGrid items={gallery} />
            </div>
          </section>
        ) : null}

        {team.visible && stylists.length ? (
          <section className="section" id="team">
            <div className="container">
              <SectionHead section={team} />
              <TeamCarousel stylists={stylists} />
            </div>
          </section>
        ) : null}

        {reviewsSection.visible && reviews.length ? (
          <section className="section reviews" id="reviews">
            <div className="container">
              <SectionHead
                section={{
                  ...reviewsSection,
                  eyebrow: [reviewsSection.eyebrow, `${studio.googleScore} from ${studio.googleCount}`].filter(Boolean).join(" · "),
                }}
              />
              <ReviewCarousel reviews={reviews} />
            </div>
          </section>
        ) : null}

        {contact.visible ? (
        <section className="section" id="contact">
          <div className="container contact-layout">
            <div className="contact-intro">
              <Eyebrow text={contact.eyebrow} />
              <h2>{contact.title}</h2>
              {contact.body ? <p className="contact-lede">{contact.body}</p> : null}
              <div className="contact-details">
                <div className="contact-detail">
                  <MapPin aria-hidden="true" />
                  <div><strong>Availability & address</strong><span>{studio.address}</span><span>{studio.landmark}.</span></div>
                </div>
                <div className="contact-detail">
                  <Phone aria-hidden="true" />
                  <div><strong>Direct concierge</strong><a href={studio.phoneHref}>{studio.phone}</a><a href={studio.whatsappHref} target="_blank" rel="noopener noreferrer">WhatsApp: {studio.whatsapp}</a><a href={`mailto:${studio.email}`}>{studio.email}</a></div>
                </div>
                {contact.details.trim() ? (
                  <div className="contact-detail">
                    <Clock3 aria-hidden="true" />
                    <div>
                      <strong>Opening hours</strong>
                      {contact.details.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
                <p className="contact-parking">{studio.parking}</p>
              </div>
            </div>
            <ContactBookingForm categories={categories} stylists={stylists} whatsappHref={studio.whatsappHref} prefill={query} />
          </div>
        </section>
        ) : null}

        {instagramSection.visible && instagram.length ? (
        <section className="instagram" id="instagram">
          <div className="container insta-head">
            <div>
              <Eyebrow text={instagramSection.eyebrow} />
              <h2>{instagramSection.title || studio.instagram}</h2>
            </div>
            {instagramSection.ctaLabel ? (
              <a className="btn btn-line" href={studio.instagramHref} target="_blank" rel="noopener noreferrer">
                {instagramSection.ctaLabel}
              </a>
            ) : null}
          </div>
          <div className="insta-row">
            {instagram.map((post) => (
              <a key={post.id} href={studio.instagramHref}>
                <img src={post.image} alt={post.alt} loading="lazy" />
              </a>
            ))}
          </div>
        </section>
        ) : null}
      </main>
  );
}

// "04 / Curated menu" keeps the number part styled separately.
function Eyebrow({ text }: { text: string }) {
  if (!text) return null;
  const match = text.match(/^(\S+\s*\/)\s*(.*)$/);
  return match ? (
    <p className="eyebrow">
      <span>{match[1]}</span> {match[2]}
    </p>
  ) : (
    <p className="eyebrow">{text}</p>
  );
}

function SectionHead({ section }: { section: SectionContent }) {
  return (
    <div className="section-head">
      <Eyebrow text={section.eyebrow} />
      <h2>{section.title}</h2>
      {section.body ? <p className="muted">{section.body}</p> : null}
    </div>
  );
}
