import "./globals.css";
import Navbar from "@/components/Navbar";
import { LanguageProvider } from "@/lib/LanguageContext";

export const metadata = {
  title: "Nirbhor | নির্ভর — Verified Trust Portal",
  description: "Verified Local Skill & Service Network — বিশ্বস্ত দক্ষতার নেটওয়ার্ক",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="min-h-screen bg-[#F1F5F5] text-slate-800 antialiased selection:bg-[#00695C] selection:text-white flex flex-col">
        <LanguageProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
