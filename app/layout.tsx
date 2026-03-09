import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OIIA Cat Generator | Make Your Cat Dance",
  description:
    "Upload your cat photo and generate a hilarious OIIA-style dance video. Free, open-source, and fun!",
  keywords: ["OIIA", "cat", "meme", "video", "generator", "dance"],
  openGraph: {
    title: "OIIA Cat Generator",
    description: "Make your cat do the OIIA dance!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
