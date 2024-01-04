import React from "react";
import Theme from "../components/theme";
import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";

export const metadata: Metadata = {
  title: {
    default: "Ketsuna - The AI Discord Bot",
    template: "%s | Ketsuna",
  },
  description:
    "Ketsuna is a Discord bot that uses AI to generates Images, Texts, and more!",
  metadataBase: new URL("https://ketsuna.com"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://ketsuna.com",
    siteName: "Ketsuna",
    title: "Ketsuna - The AI Discord Bot",
    description:
      "Ketsuna is a Discord bot that uses AI to generates Images, Texts, and more!",
    emails: ["contact@kestsuna.com"],
    countryName: "France",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <Theme>{children}</Theme>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
