/**
 * Lista de países para el selector de registro/perfil.
 *
 * Se guarda el código ISO 3166-1 alfa-2 en `users.country` (no el nombre), para
 * que la columna no dependa del idioma y sea estable si el nombre mostrado
 * cambia. `COUNTRY_CODES` es la fuente de verdad para la validación Zod.
 */

export const COUNTRIES = [
  { code: "AR", name: "Argentina" },
  { code: "BO", name: "Bolivia" },
  { code: "BR", name: "Brasil" },
  { code: "CA", name: "Canadá" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "CR", name: "Costa Rica" },
  { code: "CU", name: "Cuba" },
  { code: "EC", name: "Ecuador" },
  { code: "SV", name: "El Salvador" },
  { code: "ES", name: "España" },
  { code: "US", name: "Estados Unidos" },
  { code: "FR", name: "Francia" },
  { code: "GT", name: "Guatemala" },
  { code: "HT", name: "Haití" },
  { code: "HN", name: "Honduras" },
  { code: "IT", name: "Italia" },
  { code: "JM", name: "Jamaica" },
  { code: "MX", name: "México" },
  { code: "NI", name: "Nicaragua" },
  { code: "PA", name: "Panamá" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Perú" },
  { code: "PT", name: "Portugal" },
  { code: "PR", name: "Puerto Rico" },
  { code: "GB", name: "Reino Unido" },
  { code: "DO", name: "República Dominicana" },
  { code: "TT", name: "Trinidad y Tobago" },
  { code: "UY", name: "Uruguay" },
  { code: "VE", name: "Venezuela" },
  { code: "OTHER", name: "Otro país" },
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
  return COUNTRY_NAME_BY_CODE[code] ?? code;
}
