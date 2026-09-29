import { SiteChrome } from "@/components/SiteChrome";
import { getStudio } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const studio = await getStudio();
  return <SiteChrome studio={studio}>{children}</SiteChrome>;
}
