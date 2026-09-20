"use server";

import { supabase, UNIQUE_VIOLATION } from "@/lib/supabase";
import { normalizeEmail } from "@/server/queries/user";
import { RegisterSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";
import { z } from "zod";

type RegisterInput = z.infer<typeof RegisterSchema>;

export async function registerUser(data: RegisterInput) {
  const validated = RegisterSchema.safeParse(data);
  if (!validated.success) {
    return { error: "Datos inválidos. Revisa el formulario." };
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    documentId,
    birthDate,
    address,
    city,
    province,
    password,
    acceptedTerms,
  } = validated.data;

  // El correo se guarda siempre en minúsculas: la base tiene un índice único
  // sobre lower(email) y así el login no depende de cómo lo escriba el usuario.
  const normalizedEmail = normalizeEmail(email);
  const trimmedDocument = documentId.trim();

  const hashedPassword = await bcrypt.hash(password, 12);

  const { data: created, error } = await supabase
    .from("users")
    .insert({
      firstName,
      lastName,
      email: normalizedEmail,
      phone: phone || null,
      documentId: trimmedDocument,
      birthDate: birthDate ? new Date(birthDate).toISOString() : null,
      address,
      city,
      province,
      password: hashedPassword,
      acceptedTerms,
      acceptedTermsAt: acceptedTerms ? new Date().toISOString() : null,
    })
    .select("id,email,firstName")
    .single();

  if (error) {
    // 23505 = violación de índice único. Se distingue cuál de los dos para
    // poder decirle al usuario exactamente qué dato está repetido.
    if (error.code === UNIQUE_VIOLATION) {
      const detail = `${error.message} ${error.details ?? ""}`.toLowerCase();
      if (detail.includes("document")) {
        return { error: "Este número de documento ya está registrado." };
      }
      return { error: "Este correo electrónico ya está registrado." };
    }
    console.error("Registration failed:", error);
    return { error: "No se pudo crear la cuenta. Inténtalo de nuevo." };
  }

  const user = created as { id: string; email: string; firstName: string };

  // El correo de bienvenida no debe impedir el registro si falla.
  try {
    await sendWelcomeEmail({ to: user.email, firstName: user.firstName });
  } catch (e) {
    console.error("Failed to send welcome email:", e);
  }

  return { success: "Cuenta creada exitosamente. Puedes iniciar sesión." };
}
