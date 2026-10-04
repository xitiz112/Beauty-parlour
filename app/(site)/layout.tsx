import { SiteChrome } from "@/components/SiteChrome";
import { getBookingOptions, getLayoutContent, getStudio } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [studio, booking, layout] = await Promise.all([getStudio(), getBookingOptions(), getLayoutContent()]);
  return (
    <SiteChrome studio={studio} booking={booking} layout={layout}>
      {children}
    </SiteChrome>
  );
}
