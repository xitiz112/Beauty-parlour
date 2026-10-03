import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Clock3, MapPin, Minus, Phone, Plus } from "lucide-react";
import { ContactBookingForm } from "@/components/ContactBookingForm";
import { GalleryGrid } from "@/components/GalleryGrid";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ReviewCarousel } from "@/components/ReviewCarousel";
import { ServiceMenu } from "@/components/ServiceMenu";
import { SlideDown } from "@/components/SlideDown";
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
            <h1>Beauty, at a gentler pace.</h1>
            <p>Thoughtful hair, skin, nail, and bridal care in a calm Jhamsikhel studio—personalized for you and made to feel good long after you leave.</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#contact">
                Request an appointment
              </a>
              <a className="btn btn-ghost" href="#services">
                Explore services <ArrowUpRight className="hero-explore-arrow" aria-hidden="true" size={17} />
              </a>
            </div>
          </div>
        </section>

        <section className="trust" aria-label="Studio facts">
          <div className="container trust-row">
            <div className="trust-item">
              <div>
                <strong data-count="8">8<Plus className="trust-plus" aria-hidden="true" /></strong>
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
            <ServiceMenu categories={categories} />
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
                  <SlideDown
                    className={`ritual-item${index === 0 ? " is-featured" : ""}`}
                    triggerClassName="ritual-item-trigger"
                    key={service.id}
                    trigger={{
                      closed: (
                        <>
                          <span className="ritual-number">{String(index + 1).padStart(2, "0")}</span>
                          <span className="ritual-name">
                            <strong>{service.name}</strong>
                            <small>{note}</small>
                          </span>
                          <span className="ritual-duration">{service.durationMinutes} mins</span>
                          <span className="ritual-price">{formatFromPrice(service.price).replace("From ", "")}</span>
                          <span className="ritual-toggle" aria-hidden="true"><Plus /></span>
                        </>
                      ),
                      open: (
                        <>
                          <span className="ritual-number">{String(index + 1).padStart(2, "0")}</span>
                          <span className="ritual-name">
                            <strong>{service.name}</strong>
                            <small>{note}</small>
                          </span>
                          <span className="ritual-duration">{service.durationMinutes} mins</span>
                          <span className="ritual-price">{formatFromPrice(service.price).replace("From ", "")}</span>
                          <span className="ritual-toggle" aria-hidden="true"><Minus /></span>
                        </>
                      ),
                    }}
                  >
                    <div className="ritual-detail">
                      <p>{detail}</p>
                      <Link
                        className="ritual-book-link"
                        href={`/?category=${encodeURIComponent(category.slug)}&treatment=${encodeURIComponent(service.name)}#contact`}
                      >
                        Book this ritual <ArrowRight aria-hidden="true" size={16} />
                      </Link>
                    </div>
                  </SlideDown>
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
                          <Clock3 aria-hidden="true" />
                          <span>{service?.durationMinutes ? `${service.durationMinutes} minutes` : "Duration varies"}</span>
                        </div>
                        <p className="signature-inclusions-title">Included in this treatment</p>
                        <ul>
                          {includedServices.map((included, includedIndex) => (
                            <li key={`${item.id}-${includedIndex}`}>
                              <Check aria-hidden="true" />
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
              <Link className="btn btn-primary about-book-cta" href="/#contact">
                Book an appointment
              </Link>
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
                  <MapPin aria-hidden="true" />
                  <div><strong>Availability & address</strong><span>{studio.address}</span><span>{studio.landmark}.</span></div>
                </div>
                <div className="contact-detail">
                  <Phone aria-hidden="true" />
                  <div><strong>Direct concierge</strong><a href={studio.phoneHref}>{studio.phone}</a><a href={`mailto:${studio.email}`}>{studio.email}</a></div>
                </div>
                <div className="contact-detail">
                  <Clock3 aria-hidden="true" />
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
