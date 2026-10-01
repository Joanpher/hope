import { z } from "zod";
import { AID_TYPES, EMPLOYMENT_STATUSES } from "@/types/database";
import { COUNTRY_CODES } from "@/lib/countries";

export const AidRequestSchema = z.object({
  aidType: z.enum(AID_TYPES, {
    message: "Selecciona un tipo de ayuda",
  }),
  // Sin longitud mínima: quien pide ayuda escribe lo que puede, y un contador
  // de caracteres no es motivo para bloquearle el envío. La cadena vacía es
  // válida y satisface el NOT NULL de ambas columnas.
  description: z.string().max(2000),
  reason: z.string().max(1000),
  requestedAmount: z.string().optional().or(z.literal("")),
  householdSize: z
    .string()
    .refine((v) => !v || (Number(v) >= 1 && Number(v) <= 20), {
      message: "Número de personas inválido",
    })
    .optional()
    .or(z.literal("")),
  employmentStatus: z
    .enum(EMPLOYMENT_STATUSES)
    .optional()
    .or(z.literal("")),
  monthlyIncome: z.string().optional().or(z.literal("")),
  contactPhone: z.string().optional().or(z.literal("")),
  contactAddress: z.string().optional().or(z.literal("")),
  observations: z.string().max(500).optional().or(z.literal("")),
});

export const UpdateStatusSchema = z.object({
  status: z.string().min(1, "Selecciona un estado"),
  userComment: z.string().optional().or(z.literal("")),
  internalComment: z.string().optional().or(z.literal("")),
  sendEmail: z.boolean().default(false),
});

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  province: z.string().optional().or(z.literal("")),
  country: z.enum(COUNTRY_CODES, { message: "Selecciona tu país" }),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const ContactSchema = z.object({
  name: z.string().min(2, "Nombre requerido").max(100),
  email: z.string().email("Correo inválido"),
  phone: z.string().optional().or(z.literal("")),
  subject: z.string().min(3, "Asunto requerido").max(200),
  message: z.string().min(20, "El mensaje debe tener al menos 20 caracteres").max(2000),
});

export type AidRequestInput = z.infer<typeof AidRequestSchema>;
export type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type ContactInput = z.infer<typeof ContactSchema>;
