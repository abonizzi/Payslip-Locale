import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import BottomNav from "@/components/BottomNav";

// Carichiamo Inter una sola volta a livello di build e lo esponiamo come
// variabile CSS: così il font è IDENTICO su telefono e computer, invece di
// affidarsi al font di sistema (che varia tra iOS, Android, Windows, macOS).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Buste Paga - Dashboard",
  description: "Carica le tue buste paga ed estrai automaticamente tutti i dati.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Buste Paga",
  },
  icons: {
    icon: "/icons/icon-512.png",
    shortcut: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

// themeColor va SOLO nell'export "viewport" (Next.js 14): averlo anche in
// "metadata" genera un warning in build e può creare incoerenze tra dev e
// produzione.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0b0f14",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" className={`dark ${inter.variable}`}>
      <body className="bg-base-950 text-slate-100 antialiased min-h-screen font-sans">
        <Providers>
          {children}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
