import { Archivo, JetBrains_Mono } from "next/font/google";

// Archivo con eje de ancho real: titulares a wdth 78–85, cuerpo a 100.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

// Solo para datos: dominios, versiones, fechas, comandos y valores de tablas.
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  display: "swap",
  preload: false,
});

export const fontClasses = `${archivo.variable} ${jetbrains.variable}`;
