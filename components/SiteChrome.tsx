import type { StudioSetting } from "@prisma/client";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { InteractProvider } from "./InteractProvider";
import { Lightbox } from "./Lightbox";

export function SiteChrome({
  studio,
  children,
}: {
  studio: StudioSetting;
  children: React.ReactNode;
}) {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header shortName={studio.shortName} name={studio.name} phone={studio.phone} phoneHref={studio.phoneHref} />
      {children}
      <Footer studio={studio} />
      <Lightbox />
      <InteractProvider />
    </>
  );
}
