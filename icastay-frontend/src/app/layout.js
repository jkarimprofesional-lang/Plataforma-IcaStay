import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "IcaStay | Alojamientos Verificados en Ica",
  description: "Plataforma de reservas hoteleras con trazabilidad en Ica",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}