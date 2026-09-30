// Layout raíz de paso: el <html> lo pone app/[locale]/layout.tsx (con su lang).
// Existe para que app/not-found.tsx atrape las rutas cuyo «idioma» no existe (p. ej. /cv/nada.pdf).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
