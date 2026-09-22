import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo de HopeRise.
 *
 * Los archivos de public/brand/ salen de public/logo.png, al que se le quitó
 * el ruido que dejó el recorte del fondo (miles de píxeles casi transparentes
 * que ensuciaban el logo sobre cualquier color). Antes el logo se mostraba
 * dentro de una caja blanca con sombra y con el nombre repetido en texto al
 * lado; ahora va solo, porque el propio logo ya incluye el nombre.
 *
 * - "lockup": símbolo + HopeRise + FOUNDATION en horizontal (1044×320).
 * - "mark":   solo el símbolo, cuadrado (256×256), para espacios estrechos.
 * - tone "white": misma silueta en blanco, para fondos oscuros.
 */
const SOURCES = {
  lockup: { color: "/brand/logo-horizontal.png", white: "/brand/logo-horizontal-white.png", w: 1044, h: 320 },
  mark: { color: "/brand/logo-mark.png", white: "/brand/logo-mark-white.png", w: 256, h: 256 },
} as const;

export function BrandLogo({
  variant = "lockup",
  tone = "color",
  className,
  priority = false,
}: {
  variant?: keyof typeof SOURCES;
  tone?: "color" | "white";
  /** Controla el tamaño con una altura (h-*); el ancho se ajusta solo. */
  className?: string;
  priority?: boolean;
}) {
  const src = SOURCES[variant];
  return (
    <Image
      src={src[tone]}
      alt="HopeRise Foundation"
      width={src.w}
      height={src.h}
      priority={priority}
      className={cn("h-10 w-auto select-none", className)}
    />
  );
}
