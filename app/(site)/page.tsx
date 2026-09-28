import Link from "next/link";
import { ContactBookingForm } from "@/components/ContactBookingForm";
import { GalleryGrid } from "@/components/GalleryGrid";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ReviewCarousel } from "@/components/ReviewCarousel";
import { TeamCarousel } from "@/components/TeamCarousel";
import { getPublicCatalog } from "@/lib/data";
import { formatFromPrice } from "@/lib/time";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; treatment?: string; stylist?: string }>;
}) {
  const query = await searchParams;
  const { studio, categories, stylists, reviews, gallery, offer, signatures, instagram } = await getPublicCatalog();
  const ritualPicks = [
    {
      categorySlug: "hair",
      serviceName: "Treatment & scalp care",
      note: "Herbal-inspired hair and scalp care",
      detail: "A restorative scalp-focused service with a finish tailored to your hair’s needs.",
    },
    {
      categorySlug: "skin",
      serviceName: "Hydra glow",
      note: "Deeply hydrating facial",
      detail: "A hydrating facial ritual paced to your skin, leaving time for a calm, considered finish.",
    },
    {
      categorySlug: "hair",
      serviceName: "Lived-in balayage + gloss",
      note: "Dimensional color and conditioning gloss",
      detail: "Hand-painted color and a gloss chosen to keep the result soft, shiny, and easy to grow out.",
    },
    {
      categorySlug: "skin",
      serviceName: "Glass-skin facial",
      note: "Advanced facial therapy",
      detail: "A thoughtful cleanse, targeted care, and hydration, adjusted to your skin on the day.",
    },
  ]
    .map((pick) => {
      const category = categories.find((item) => item.slug === pick.categorySlug);
      const service = category?.services.find((item) => item.name === pick.serviceName);
      return category && service ? { ...pick, category, service } : null;
    })
    .filter((item) => item !== null);

  return (
      <main id="main">
        <section className="hero" id="home" aria-label="Introduction">
          <HeroCarousel
            slides={[
              { src: studio.heroImage, alt: "Warm salon interior with styling chairs and soft lighting" },
              {
                src: "https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=2000",
                alt: "Lived-in balayage and gloss",
              },
              {
                src: "https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=2000",
                alt: "Smooth keratin finish",
              },
              {
                src: "https://images.pexels.com/photos/853427/pexels-photo-853427.jpeg?auto=compress&cs=tinysrgb&w=2000",
                alt: "Soft bridal glam",
              },
              {
                src: "https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg?auto=compress&cs=tinysrgb&w=2000",
                alt: "Quiet facial treatment",
              },
            ]}
          />
          <div className="hero-copy">
            <h1>Hair, skin, and bridal beauty in one calm studio.</h1>
            <p>Senior stylists, sanitized tools, and time enough to get the color right.</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#contact">
                Request an appointment
              </a>
              <a className="btn btn-ghost" href="#services">
                Explore services
              </a>
            </div>
          </div>
        </section>

        <section className="trust" aria-label="Studio facts">
          <div className="container trust-row">
            <div className="trust-item">
              <div>
                <strong data-count="8">8</strong>
                <span className="trust-label">Years in Jhamsikhel</span>
              </div>
            </div>
            <div className="trust-item">
              <div>
                <strong>
                  <span data-count="400">400</span>+
                </strong>
                <span className="trust-label">Brides styled</span>
              </div>
            </div>
            <div className="trust-item">
              <div>
                <strong>Keratin & color</strong>
                <span className="trust-label">Signature strength</span>
              </div>
            </div>
            <div className="trust-item">
              <div>
                <strong>Sanitized tools</strong>
                <span className="trust-label">Every single chair</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="services">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Menu</p>
              <h2>Find your kind of care.</h2>
              <p className="muted">A considered selection of hair, skin, makeup, nail, bridal, and package services, with starting prices shown on each card.</p>
            </div>
            <div className="card-grid">
              {categories.map((category) => (
                <article key={category.id} id={category.slug === "bridal" ? "bridal" : undefined} className="card">
                  <div className="card-visual">
                    <div className="card-media">
                      <img src={category.image} alt={category.name} />
                    </div>
                    <span className="card-tag">{formatFromPrice(category.fromPrice)}</span>
                  </div>
                  <div className="card-body">
                    <h3>{category.name}</h3>
                    <p>
                      {category.teaser}
                      {category.featured ? ` ${formatFromPrice(category.fromPrice)}.` : ""}
                    </p>
                    <Link className="btn btn-line" href={`/?category=${encodeURIComponent(category.slug)}#contact`}>
                      Book now
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section ritual-section" id="rituals">
          <div className="container ritual-layout">
            <img
              className="ritual-image"
              src={studio.aboutImage}
              alt="Warm, softly lit interior of the Liora beauty studio"
              loading="lazy"
            />
            <div className="ritual-content">
              <div className="ritual-heading">
                <p className="eyebrow"><span>04 /</span> Curated menu</p>
                <h2>Featured Botanical Rituals</h2>
              </div>
              <div className="ritual-list">
                {ritualPicks.map(({ category, service, note, detail }, index) => (
                  <details className={`ritual-item${index === 0 ? " is-featured" : ""}`} key={service.id}>
                    <summary>
                      <span className="ritual-number">{String(index + 1).padStart(2, "0")}</span>
                      <span className="ritual-name">
                        <strong>{service.name}</strong>
                        <small>{note}</small>
                      </span>
                      <span className="ritual-duration">{service.durationMinutes} mins</span>
                      <span className="ritual-price">{formatFromPrice(service.price).replace("From ", "")}</span>
                      <span className="ritual-toggle" aria-hidden="true" />
                    </summary>
                    <div className="ritual-detail">
                      <p>{detail}</p>
                      <Link
                        href={`/?category=${encodeURIComponent(category.slug)}&treatment=${encodeURIComponent(service.name)}#contact`}
                      >
                        Book this ritual <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="signature">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">This season</p>
              <h2>Our popular packages.</h2>
            </div>
            <div className="signature-list">
              {signatures.map((item, index) => {
                const category = categories.find((entry) => entry.slug === item.categorySlug);
                const service = category?.services.find((entry) => entry.name === item.treatmentName);
                const includedServices =
                  service?.description
                    ? service.description.split(/,|\band\b/i).map((part) => part.trim()).filter(Boolean)
                    : item.treatmentName === "Lived-in balayage + gloss"
                      ? ["Personalized color consultation", "Hand-painted balayage", "Gloss and conditioning finish"]
                      : item.treatmentName === "Glass-skin facial"
                        ? ["Skin consultation", "Gentle cleanse and targeted care", "Deep hydration and finishing"]
                        : item.treatmentName === "Bridal trial"
                          ? ["Daylight look consultation", "Hair and makeup trial", "First drape and reference photos"]
                          : [service?.name || item.treatmentName, item.story];
                return (
                  <article className="signature" key={item.id}>
                    <img src={item.image} alt={item.name} loading="lazy" />
                    <div>
                      <span className="sig-num">0{index + 1}</span>
                      <h3>{item.name}</h3>
                      <p className="from">{formatFromPrice(item.fromPrice)}</p>
                      <div className="signature-inclusions">
                        <div className="signature-duration">
                          <svg viewBox="0 0 20 20" aria-hidden="true">
                            <circle cx="10" cy="10" r="7.5" />
                            <path d="M10 5.5v4.8l3 1.8" />
                          </svg>
                          <span>{service?.durationMinutes ? `${service.durationMinutes} minutes` : "Duration varies"}</span>
                        </div>
                        <p className="signature-inclusions-title">Included in this treatment</p>
                        <ul>
                          {includedServices.map((included, includedIndex) => (
                            <li key={`${item.id}-${includedIndex}`}>
                              <svg viewBox="0 0 20 20" aria-hidden="true">
                                <circle cx="10" cy="10" r="8" />
                                <path d="m6.5 10 2.3 2.3 4.8-5" />
                              </svg>
                              <span>{included}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Link
                        className="btn btn-primary"
                        href={`/?category=${encodeURIComponent(item.categorySlug)}&treatment=${encodeURIComponent(item.treatmentName)}#contact`}
                      >
                        Book Now
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
                <a className="btn btn-light" href="#contact">
                  {offer.cta}
                </a>
              </aside>
            ) : null}
          </div>
        </section>

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
              <p className="eyebrow">About us</p>
              <h2>A smaller room, on purpose.</h2>
              <p>{studio.aboutWords}</p>
              <p>{studio.ownerName} started Liora in Jhamsikhel after years of working rooms that booked too tightly. Color, bridal, skin, and nails share one quiet floor, and every tool is sanitized between guests. We take time with color so it still looks like you on a Tuesday. If a look will not grow out kindly, we say so before the first foil goes in.</p>
            </div>
          </div>
        </section>

        <section className="section" id="gallery">
          <div className="container">
            <div className="section-head row">
              <div>
                <p className="eyebrow">Our work</p>
                <h2>Looks from the studio.</h2>
              </div>
            </div>
            <GalleryGrid items={gallery} />
          </div>
        </section>

        <section className="section" id="team">
          <div className="container">
            <div className="section-head row">
              <div>
                <p className="eyebrow">Our team</p>
                <h2>Meet the people behind the chair.</h2>
              </div>
            </div>
            <TeamCarousel stylists={stylists} />
          </div>
        </section>

        <section className="section reviews" id="reviews">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">
                Reviews · {studio.googleScore} from {studio.googleCount}
              </p>
              <h2>What guests remember.</h2>
            </div>
            <ReviewCarousel reviews={reviews} />
          </div>
        </section>

        <section className="section" id="contact">
          <div className="container contact-layout">
            <div className="contact-intro">
              <p className="eyebrow">The sanctuary</p>
              <h2>Visit Liora</h2>
              <p className="contact-lede">Find us in the heart of Jhamsikhel. Step inside, take a breath, and let us make a little space for you.</p>
              <div className="contact-details">
                <div className="contact-detail">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
                  <div><strong>The studio</strong><span>{studio.address}</span><span>{studio.landmark}.</span></div>
                </div>
                <div className="contact-detail">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.8c.3-.7 1.1-1.1 1.8-.9l2.2.6c.6.2 1 .7 1.1 1.4l.4 2.4c.1.6-.2 1.2-.7 1.5l-1.3.9a12.6 12.6 0 0 0 5.2 5.2l.9-1.3c.3-.5.9-.8 1.5-.7l2.4.4c.7.1 1.2.5 1.4 1.1l.6 2.2c.2.7-.2 1.5-.9 1.8l-1.6.7c-.8.3-1.6.4-2.4.2C10.2 18.6 5.4 13.8 4.7 7.8c-.2-.8-.1-1.6.2-2.4l.7-1.6Z" /></svg>
                  <div><strong>Direct concierge</strong><a href={studio.phoneHref}>{studio.phone}</a><a href={`mailto:${studio.email}`}>{studio.email}</a></div>
                </div>
                <div className="contact-detail">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>
                  <div><strong>Opening hours</strong><span>Sunday–Friday · 10:00 AM – 7:00 PM</span><span>Saturday · 9:00 AM – 6:00 PM</span></div>
                </div>
                <p className="contact-parking">{studio.parking}</p>
              </div>
            </div>
            <ContactBookingForm categories={categories} stylists={stylists} whatsappHref={studio.whatsappHref} prefill={query} />
          </div>
        </section>

        <section className="instagram" id="instagram">
          <div className="container insta-head">
            <div>
              <p className="eyebrow">Instagram</p>
              <h2>{studio.instagram}</h2>
            </div>
            <a className="btn btn-line" href={studio.instagramHref}>
              Follow
            </a>
          </div>
          <div className="insta-row">
            {instagram.map((post) => (
              <a key={post.id} href={studio.instagramHref}>
                <img src={post.image} alt={post.alt} loading="lazy" />
              </a>
            ))}
          </div>
        </section>
      </main>
  );
}
