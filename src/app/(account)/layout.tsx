/**
 * Layout de las pantallas de cuenta (registro y entrada). Vive fuera de
 * (auth) porque aquel encierra el contenido en una tarjeta de 448 px, y estas
 * pantallas necesitan el ancho completo: a dos columnas en escritorio y a
 * pantalla completa en móvil. El marco visual está en AccountShell.
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-white">{children}</div>;
}
