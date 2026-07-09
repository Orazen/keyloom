import type { Metadata } from "next";
import {
  Anton,
  Archivo_Black,
  Bebas_Neue,
  Courier_Prime,
  Inter,
  Lilita_One,
  Montserrat,
  Permanent_Marker,
  Playfair_Display,
  Poppins,
} from "next/font/google";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Captions",
  description:
    "Word-perfect captions on your video, transcribed by Whisper — restyle, trim, export.",
};

// Display fonts for the caption picker, loaded on this route only. next/font
// registers each face under its Google family name, so the Remotion Player's
// `font-family: 'Anton'` (etc.) resolves without a runtime fetch.
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-anton",
});
const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-bebas",
});
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-archivo-black",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: "900",
  display: "swap",
  variable: "--font-poppins",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: "900",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-montserrat",
});
const lilitaOne = Lilita_One({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-lilita-one",
});
const inter = Inter({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
  variable: "--font-inter-caption",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: "700",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair",
});
const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
  variable: "--font-courier-prime",
});
const permanentMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-permanent-marker",
});

export default function CaptionsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppShell>
      <div
        className={`${anton.variable} ${bebas.variable} ${archivoBlack.variable} ${poppins.variable} ${montserrat.variable} ${lilitaOne.variable} ${inter.variable} ${playfair.variable} ${courierPrime.variable} ${permanentMarker.variable} flex h-[calc(100svh-3rem)] flex-col`}
      >
        {children}
      </div>
    </AppShell>
  );
}
