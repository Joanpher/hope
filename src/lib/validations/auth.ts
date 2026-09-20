import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const RegisterSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(50),
    lastName: z
      .string()
      .min(2, "El apellido debe tener al menos 2 caracteres")
      .max(50),
    email: z.string().email("Correo electrónico inválido"),
    phone: z.string().min(7, "Teléfono inválido").optional().or(z.literal("")),
    documentId: z
      .string()
      .min(5, "Documento de identificación inválido")
      .max(20),
    birthDate: z.string().optional().or(z.literal("")),
    address: z.string().min(5, "Dirección requerida"),
    city: z.string().min(2, "Ciudad/Municipio requerido"),
    province: z.string().min(2, "Provincia/Estado requerido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z.string(),
    acceptedTerms: z.boolean().refine((v) => v === true, {
      message: "Debes aceptar los términos y condiciones",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
});

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z.string(),
    token: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
