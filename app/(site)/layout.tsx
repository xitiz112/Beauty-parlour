import { SiteChrome } from "@/components/SiteChrome";
import { getStudio } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const studio = await getStudio();
  return <SiteChrome studio={studio}>{children}</SiteChrome>;
}
