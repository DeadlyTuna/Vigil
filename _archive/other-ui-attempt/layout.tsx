import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VIGIL-M1 — Real-Time Predictive Maintenance Dashboard",
  description:
    "Design and simulation of a real-time embedded predictive maintenance system for industrial motor fault detection. Monitors vibration, temperature, current, and RPM with RTOS-based firmware.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} dark`}
    >
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
