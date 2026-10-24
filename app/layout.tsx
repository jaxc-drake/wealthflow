import type { Metadata, Viewport } from "next";
import { Space_Grotesk, DM_Sans, JetBrains_Mono, Archivo_Black } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const archivoBlack = Archivo_Black({ subsets: ["latin"], variable: "--font-archivo", weight: "400" });

export const metadata: Metadata = {
  title: "WealthFlow – Catat & Kelola Keuangan Pribadi",
  description: "Aplikasi pencatatan keuangan pribadi yang modern.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#E9E4FF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${archivoBlack.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
