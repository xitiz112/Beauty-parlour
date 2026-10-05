import type { Metadata } from "next";
import "./styles.css";
import "./interact.css";

export const metadata: Metadata = {
  title: {
    default: "Liora Beauty Studio — Hair, skin, and bridal in Jhamsikhel",
    template: "%s — Liora Beauty Studio",
  },
  description:
    "Liora is a calm beauty studio in Jhamsikhel, Lalitpur for hair, skin, nails, makeup, and bridal. Book a real chair online.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Outfit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
