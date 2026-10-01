import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AidRequestStatus } from "@/types/database";
import { REQUEST_CODE_PREFIX, STATUS_FLOW, TERMINAL_STATUSES } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique request code: AYU-YYYY-NNNNNN
 */
export function generateRequestCode(sequence: number): string {
  const year = new Date().getFullYear();
  const seq = String(sequence).padStart(6, "0");
  return `${REQUEST_CODE_PREFIX}-${year}-${seq}`;
}

/**
 * Get the step index in the progress flow
 */
export function getStatusStep(status: AidRequestStatus): number {
  if (TERMINAL_STATUSES.includes(status)) return -1;
  return STATUS_FLOW.indexOf(status);
}

/**
 * Convierte a Date un valor que puede venir de PostgREST como cadena.
 *
 * Si la cadena es ISO pero no lleva zona horaria (lo que ocurre con las
 * columnas `timestamp` sin `timestamptz`), JavaScript la interpretaría como
 * hora local aunque la base la guarda en UTC, desplazando la fecha varias
 * horas. Añadir la "Z" la fija en UTC.
 *
 * Tras aplicar migraciones/003_timestamptz.sql las cadenas ya traen offset y
 * esta función las deja intactas, así que es correcta en ambos casos.
 */
export function toDate(value: Date | string): Date {
  if (value instanceof Date) return value;
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value);
  const isIsoDateTime = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(value);
  return new Date(isIsoDateTime && !hasTimezone ? `${value}Z` : value);
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(toDate(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(toDate(date));
}

export function formatShortDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(toDate(date));
}

/**
 * Truncate text to given length
 */
export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/**
 * Generate a secure random token
 */
import crypto from "crypto";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Formatea un monto en USD. Toda la aplicación guarda y muestra los montos de
 * las solicitudes de ayuda en dólares estadounidenses, sin importar el país
 * del solicitante, para que los montos sean comparables entre países.
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (!amount && amount !== 0) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Enlaces de contacto para un teléfono guardado tal como lo escribió la persona.
 *
 * `tel:` funciona con cualquier formato, así que siempre se genera. El enlace de
 * WhatsApp solo se ofrece cuando el número trae prefijo internacional explícito:
 * wa.me exige el código de país y, siendo la aplicación multi-país, adivinarlo a
 * partir de un número local llevaría a abrir chats con desconocidos.
 */
export function phoneLinks(phone: string | null | undefined): {
  tel: string;
  whatsapp: string | null;
} | null {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const isInternational = phone.trim().startsWith("+");
  return {
    tel: `tel:${phone.trim().startsWith("+") ? "+" : ""}${digits}`,
    whatsapp: isInternational ? `https://wa.me/${digits}` : null,
  };
}

/**
 * Get initials from name
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .toLowerCase();
}
