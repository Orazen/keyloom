import type { Metadata } from "next";
import { Anton, Archivo_Black, Bebas_Neue, Poppins } from "next/font/google";
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

export default function CaptionsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppShell>
      <div
        className={`${anton.variable} ${bebas.variable} ${archivoBlack.variable} ${poppins.variable} flex h-[calc(100svh-3rem)] flex-col`}
      >
        {children}
      </div>
    </AppShell>
  );
}
