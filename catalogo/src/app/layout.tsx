import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], display: "swap", variable: "--font-fraunces" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["300", "400"], display: "swap", variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "dsto · design system de Taller Oliva",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${fraunces.variable} ${jetbrains.variable} antialiased`}>
      <body className="font-display">{children}</body>
    </html>
  );
}
