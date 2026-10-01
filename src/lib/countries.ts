/**
 * Países donde opera la fundación.
 *
 * Es la única lista válida: alimenta el selector de registro/perfil, la
 * validación Zod (`COUNTRY_CODES`) y la franja de banderas de la portada. Si se
 * abre un país nuevo, se añade aquí y los tres sitios quedan al día.
 *
 * Se guarda el código ISO 3166-1 alfa-2 en `users.country` (no el nombre), para
 * que la columna no dependa del idioma y sea estable si el nombre mostrado
 * cambia.
 *
 * El orden no es alfabético a propósito: es el orden de operación que marcó la
 * fundación, y es el que ve el usuario en el selector y en la portada.
 *
 * `flag` apunta a un SVG en `public/flags/`. Son los de `flag-icons` (MIT,
 * ver `public/flags/LICENSE.txt`), copiados al repositorio en vez de instalados
 * como dependencia: son nueve archivos estáticos que no cambian, y así la
 * portada no depende de un CDN externo ni de un paquete en `node_modules`.
 */

export const COUNTRIES = [
  { code: "US", name: "Estados Unidos", flag: "/flags/us.svg" },
  { code: "DO", name: "República Dominicana", flag: "/flags/do.svg" },
  { code: "PR", name: "Puerto Rico", flag: "/flags/pr.svg" },
  { code: "MX", name: "México", flag: "/flags/mx.svg" },
  { code: "HN", name: "Honduras", flag: "/flags/hn.svg" },
  { code: "GT", name: "Guatemala", flag: "/flags/gt.svg" },
  { code: "PA", name: "Panamá", flag: "/flags/pa.svg" },
  { code: "CO", name: "Colombia", flag: "/flags/co.svg" },
  { code: "BR", name: "Brasil", flag: "/flags/br.svg" },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];

export const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as [
  CountryCode,
  ...CountryCode[],
];

const COUNTRY_NAME_BY_CODE: Record<string, string> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c.name])
);

export function getCountryName(code: string | null | undefined): string {
  if (!code) return "—";
  // Si una cuenta antigua guardó un país que ya no está en la lista, se muestra
  // el código en crudo antes que un hueco: el dato sigue siendo legible.
  return COUNTRY_NAME_BY_CODE[code] ?? code;
}
