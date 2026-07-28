import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const metadataBase = new URL(
    host ? `${protocol}://${host}` : "https://one-wish-willow.example",
  );

  return {
    metadataBase,
    title: "ONE WISH WILLOW｜想清楚，再折断它",
    description:
      "写下唯一的愿望，亲手折断 ONE WISH WILLOW。愿望一经许下，不可撤销。",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "ONE WISH WILLOW｜想清楚，再折断它",
      description: "只允许一个愿望。谨慎措辞，后果自负。",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "ONE WISH WILLOW｜想清楚，再折断它",
      description: "只允许一个愿望。谨慎措辞，后果自负。",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
