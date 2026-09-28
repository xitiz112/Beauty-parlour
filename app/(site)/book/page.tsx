import { redirect } from "next/navigation";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; treatment?: string; stylist?: string }>;
}) {
  const query = await searchParams;
  const params = new URLSearchParams();
  for (const key of ["category", "treatment", "stylist"] as const) {
    if (query[key]) params.set(key, query[key]!);
  }
  redirect(`/${params.size ? `?${params.toString()}` : ""}#contact`);
}
