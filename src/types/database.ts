/**
 * Tipos de la base de datos (Supabase / PostgreSQL).
 *
 * Sustituye a los tipos que antes generaba Prisma en @prisma/client.
 * Debe mantenerse sincronizado con migraciones/001_esquema_inicial.sql.
 *
 * Cada enum se declara como array `as const` (valor en tiempo de ejecución,
 * necesario para Zod y para los selectores de la UI) y como tipo unión
 * derivado del array, para que nunca puedan desincronizarse entre sí.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export const USER_ROLES = ["USER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const AID_REQUEST_STATUSES = [
  "RECEIVED",
  "IN_REVIEW",
  "PENDING_DOCS",
  "EVALUATION",
  "APPROVED",
  "PREPARING",
  "DELIVERED",
  "REJECTED",
  "CANCELLED",
] as const;
export type AidRequestStatus = (typeof AID_REQUEST_STATUSES)[number];

export const AID_TYPES = [
  "FOOD",
  "MEDICINE",
  "HEALTH",
  "EDUCATION",
  "HOUSING",
  "EMERGENCY",
  "ECONOMIC",
  "OTHER",
] as const;
export type AidType = (typeof AID_TYPES)[number];

export const EMPLOYMENT_STATUSES = [
  "EMPLOYED",
  "UNEMPLOYED",
  "SELF_EMPLOYED",
  "RETIRED",
  "STUDENT",
  "OTHER",
] as const;
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type Priority = (typeof PRIORITIES)[number];

// ─── Filas de las tablas ──────────────────────────────────────────────────────
//
// PostgREST devuelve las fechas como cadenas ISO-8601, no como objetos Date.
// Los helpers de src/lib/utils.ts aceptan ambos (`Date | string`).

export interface User {
  id: string;
  email: string;
  emailVerified: string | null;
  password: string;
  role: UserRole;
  isActive: boolean;
  firstName: string;
  lastName: string;
  phone: string | null;
  documentId: string;
  birthDate: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  acceptedTerms: boolean;
  acceptedTermsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AidRequest {
  id: string;
  code: string;
  status: AidRequestStatus;
  priority: Priority;
  aidType: AidType;
  description: string;
  reason: string;
  requestedAmount: number | null;
  householdSize: number | null;
  employmentStatus: EmploymentStatus | null;
  monthlyIncome: number | null;
  contactPhone: string | null;
  contactAddress: string | null;
  observations: string | null;
  internalNotes: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AidRequestHistory {
  id: string;
  previousStatus: AidRequestStatus | null;
  newStatus: AidRequestStatus;
  description: string;
  userComment: string | null;
  internalComment: string | null;
  changedById: string | null;
  aidRequestId: string;
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  aidRequestId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  aidRequestId: string | null;
  createdAt: string;
}

export interface PasswordResetToken {
  id: string;
  token: string;
  email: string;
  userId: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Formas con relaciones embebidas ──────────────────────────────────────────
// Corresponden a los `select` anidados de PostgREST en src/server/queries.

export type UserSummary = Pick<
  User,
  | "id"
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "documentId"
  | "address"
  | "city"
  | "province"
>;

export type HistoryWithAuthor = AidRequestHistory & {
  changedBy: Pick<User, "firstName" | "lastName" | "email"> | null;
};

export type AidRequestWithRelations = AidRequest & {
  user: UserSummary;
  history: HistoryWithAuthor[];
  documents: Document[];
};

export type AidRequestWithUser = AidRequest & {
  user: Pick<User, "firstName" | "lastName" | "email" | "documentId">;
};

export type AidRequestWithHistory = AidRequest & {
  history: HistoryWithAuthor[];
};
