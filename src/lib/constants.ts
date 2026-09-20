import type { AidRequestStatus, AidType, Priority, UserRole } from "@/types/database";

// ─── Status labels ────────────────────────────────────────────────────────────
export const STATUS_LABELS: Record<AidRequestStatus, string> = {
  RECEIVED: "Solicitud recibida",
  IN_REVIEW: "En revisión",
  PENDING_DOCS: "Documentación pendiente",
  EVALUATION: "En evaluación",
  APPROVED: "Aprobada",
  PREPARING: "Preparando ayuda",
  DELIVERED: "Ayuda entregada",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
};

// ─── Status descriptions ──────────────────────────────────────────────────────
export const STATUS_DESCRIPTIONS: Record<AidRequestStatus, string> = {
  RECEIVED: "Tu solicitud ha sido registrada correctamente en nuestro sistema.",
  IN_REVIEW: "Nuestro equipo está revisando tu solicitud.",
  PENDING_DOCS: "Se requiere documentación adicional para continuar.",
  EVALUATION: "Tu caso está siendo evaluado por nuestros especialistas.",
  APPROVED: "¡Tu solicitud ha sido aprobada! Estamos preparando la ayuda.",
  PREPARING: "Estamos preparando y coordinando la entrega de la ayuda.",
  DELIVERED: "La ayuda ha sido entregada exitosamente. ¡Gracias por confiar en nosotros!",
  REJECTED: "Lamentablemente, tu solicitud no pudo ser aprobada en esta ocasión.",
  CANCELLED: "La solicitud ha sido cancelada.",
};

// ─── Status colors ────────────────────────────────────────────────────────────
export const STATUS_COLORS: Record<AidRequestStatus, string> = {
  RECEIVED: "bg-blue-100 text-blue-800 border-blue-200",
  IN_REVIEW: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PENDING_DOCS: "bg-orange-100 text-orange-800 border-orange-200",
  EVALUATION: "bg-purple-100 text-purple-800 border-purple-200",
  APPROVED: "bg-green-100 text-green-800 border-green-200",
  PREPARING: "bg-teal-100 text-teal-800 border-teal-200",
  DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  CANCELLED: "bg-gray-100 text-gray-800 border-gray-200",
};

// ─── Aid type labels ──────────────────────────────────────────────────────────
export const AID_TYPE_LABELS: Record<AidType, string> = {
  FOOD: "Alimentación",
  MEDICINE: "Medicamentos",
  HEALTH: "Salud",
  EDUCATION: "Educación",
  HOUSING: "Vivienda",
  EMERGENCY: "Emergencia",
  ECONOMIC: "Ayuda económica",
  OTHER: "Otro",
};

// ─── Priority labels ──────────────────────────────────────────────────────────
export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

// ─── Role labels ──────────────────────────────────────────────────────────────
export const ROLE_LABELS: Record<UserRole, string> = {
  USER: "Usuario",
  ADMIN: "Administrador",
};

// ─── Status stepper flow (excluding terminal states) ──────────────────────────
export const STATUS_FLOW: AidRequestStatus[] = [
  "RECEIVED",
  "IN_REVIEW",
  "EVALUATION",
  "APPROVED",
  "PREPARING",
  "DELIVERED",
];

export const TERMINAL_STATUSES: AidRequestStatus[] = ["REJECTED", "CANCELLED"];

// ─── Employment status labels ─────────────────────────────────────────────────
export const EMPLOYMENT_STATUS_LABELS = {
  EMPLOYED: "Empleado",
  UNEMPLOYED: "Desempleado",
  SELF_EMPLOYED: "Trabajador independiente",
  RETIRED: "Jubilado/Pensionado",
  STUDENT: "Estudiante",
  OTHER: "Otro",
};

// ─── Code prefix ─────────────────────────────────────────────────────────────
export const REQUEST_CODE_PREFIX = "AYU";
