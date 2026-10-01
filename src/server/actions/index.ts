"use server";

import { supabase } from "@/lib/supabase";
import { auth } from "@/lib/auth";
import {
  AidRequestSchema,
  UpdateStatusSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
} from "@/lib/validations";
import { generateRequestCode, generateToken, toDate } from "@/lib/utils";
import {
  getNextRequestSequence,
  getAidRequestById,
} from "@/server/queries/aid-request";
import {
  sendAidRequestConfirmationEmail,
  sendStatusChangeEmail,
} from "@/lib/email";
import type {
  AidRequest,
  AidRequestStatus,
  EmploymentStatus,
  PasswordResetToken,
  User,
} from "@/types/database";
import { STATUS_LABELS } from "@/lib/constants";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getUserById, normalizeEmail } from "@/server/queries/user";

// ─── Create Aid Request ───────────────────────────────────────────────────────
export async function createAidRequest(
  data: z.infer<typeof AidRequestSchema>
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  const validated = AidRequestSchema.safeParse(data);
  if (!validated.success) return { error: "Datos inválidos" };

  const {
    aidType,
    description,
    reason,
    requestedAmount,
    householdSize,
    employmentStatus,
    monthlyIncome,
    contactPhone,
    contactAddress,
    observations,
  } = validated.data;

  const sequence = await getNextRequestSequence();
  const code = generateRequestCode(sequence);

  const { data: request, error } = await supabase
    .from("aid_requests")
    .insert({
      code,
      aidType,
      description,
      reason,
      requestedAmount: requestedAmount ? parseFloat(requestedAmount) : null,
      householdSize: householdSize ? parseInt(householdSize) : null,
      employmentStatus: (employmentStatus as EmploymentStatus) || null,
      monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : null,
      contactPhone: contactPhone || null,
      contactAddress: contactAddress || null,
      observations: observations || null,
      userId: session.user.id,
    })
    .select()
    .single();

  if (error || !request) {
    console.error("Failed to create aid request:", error);
    return { error: "No se pudo registrar la solicitud. Inténtalo de nuevo." };
  }

  const created = request as AidRequest;

  // Entrada inicial de la bitácora
  const { error: historyError } = await supabase
    .from("aid_request_history")
    .insert({
      aidRequestId: created.id,
      newStatus: "RECEIVED" satisfies AidRequestStatus,
      description: "Solicitud creada y registrada en el sistema.",
      userComment: "Tu solicitud ha sido recibida exitosamente.",
    });
  if (historyError) console.error("Failed to write history:", historyError);

  // Notificación para el beneficiario
  const { error: notifyError } = await supabase.from("notifications").insert({
    userId: session.user.id,
    aidRequestId: created.id,
    title: "Solicitud creada",
    message: `Tu solicitud ${code} ha sido registrada exitosamente.`,
  });
  if (notifyError) console.error("Failed to create notification:", notifyError);

  // Correo de confirmación con el detalle completo y el acta en PDF adjunta.
  const user = await getUserById(session.user.id);
  if (user) {
    // El acta se arma en su propio try: si fallara, el correo debe salir igual
    // sin adjunto, en vez de dejar a la persona sin confirmación de nada.
    // Se relee la solicitud porque el acta necesita los datos del solicitante,
    // y así el PDF adjunto es idéntico al que luego descarga desde el panel.
    let document: { filename: string; content: Buffer } | undefined;
    try {
      const full = await getAidRequestById(created.id);
      if (full) {
        const { renderAidRequestDocument } = await import(
          "@/lib/pdf/aid-request-document"
        );
        document = {
          filename: `HopeRise-${code}.pdf`,
          content: await renderAidRequestDocument(full),
        };
      }
    } catch (e) {
      console.error("Failed to render aid request document:", e);
    }

    try {
      await sendAidRequestConfirmationEmail({
        to: user.email,
        firstName: user.firstName,
        request: created,
        document,
      });
    } catch (e) {
      console.error("Failed to send confirmation email:", e);
    }
  }

  revalidatePath("/solicitudes");
  revalidatePath("/dashboard");

  return { success: true, code };
}

// ─── Update Request Status (Admin) ───────────────────────────────────────────
export async function updateAidRequestStatus(
  requestId: string,
  data: z.infer<typeof UpdateStatusSchema>
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "No autorizado" };
  }

  const validated = UpdateStatusSchema.safeParse(data);
  if (!validated.success) return { error: "Datos inválidos" };

  const { status, userComment, internalComment, sendEmail } = validated.data;

  const request = await getAidRequestById(requestId);
  if (!request) return { error: "Solicitud no encontrada" };

  const previousStatus = request.status;
  const newStatus = status as AidRequestStatus;

  // El trigger `aid_requests_set_updated_at` actualiza "updatedAt" en la base.
  const { error: updateError } = await supabase
    .from("aid_requests")
    .update({ status: newStatus })
    .eq("id", requestId);

  if (updateError) {
    console.error("Failed to update status:", updateError);
    return { error: "No se pudo actualizar el estado." };
  }

  const { error: historyError } = await supabase
    .from("aid_request_history")
    .insert({
      aidRequestId: requestId,
      previousStatus,
      newStatus,
      description: `Estado cambiado de "${STATUS_LABELS[previousStatus]}" a "${STATUS_LABELS[newStatus]}"`,
      userComment: userComment || null,
      internalComment: internalComment || null,
      changedById: session.user.id,
    });
  if (historyError) console.error("Failed to write history:", historyError);

  const { error: notifyError } = await supabase.from("notifications").insert({
    userId: request.userId,
    aidRequestId: requestId,
    title: "Actualización de tu solicitud",
    message: `Tu solicitud ${request.code} cambió a: ${STATUS_LABELS[newStatus]}.${userComment ? ` "${userComment}"` : ""}`,
  });
  if (notifyError) console.error("Failed to create notification:", notifyError);

  if (sendEmail) {
    try {
      await sendStatusChangeEmail({
        to: request.user.email,
        firstName: request.user.firstName,
        code: request.code,
        previousStatus,
        newStatus,
        userComment: userComment || "",
      });
    } catch (e) {
      console.error("Failed to send status email:", e);
    }
  }

  revalidatePath(`/admin/solicitudes/${requestId}`);
  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin");

  return { success: true };
}

// ─── Update Profile ───────────────────────────────────────────────────────────
export async function updateProfile(data: z.infer<typeof UpdateProfileSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  const validated = UpdateProfileSchema.safeParse(data);
  if (!validated.success) return { error: "Datos inválidos" };

  const { error } = await supabase
    .from("users")
    .update(validated.data)
    .eq("id", session.user.id);

  if (error) {
    console.error("Failed to update profile:", error);
    return { error: "No se pudo actualizar el perfil." };
  }

  revalidatePath("/perfil");
  return { success: "Perfil actualizado exitosamente." };
}

// ─── Change Password ──────────────────────────────────────────────────────────
export async function changePassword(
  data: z.infer<typeof ChangePasswordSchema>
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  const validated = ChangePasswordSchema.safeParse(data);
  if (!validated.success) return { error: "Datos inválidos" };

  const { currentPassword, newPassword } = validated.data;

  const user = await getUserById(session.user.id);
  if (!user) return { error: "Usuario no encontrado" };

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return { error: "La contraseña actual es incorrecta" };

  const hashed = await bcrypt.hash(newPassword, 12);
  const { error } = await supabase
    .from("users")
    .update({ password: hashed })
    .eq("id", session.user.id);

  if (error) {
    console.error("Failed to change password:", error);
    return { error: "No se pudo actualizar la contraseña." };
  }

  return { success: "Contraseña actualizada exitosamente." };
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
export async function forgotPassword(email: string) {
  // Respuesta idéntica exista o no la cuenta, para no revelar qué correos
  // están registrados.
  const genericResponse = {
    success: "Si el correo existe, recibirás un enlace de recuperación.",
  };

  const normalized = normalizeEmail(email);

  const { data: user, error } = await supabase
    .from("users")
    .select("id,email,firstName")
    .eq("email", normalized)
    .maybeSingle();

  if (error) {
    console.error("Failed to look up user:", error);
    return genericResponse;
  }
  if (!user) return genericResponse;

  const account = user as Pick<User, "id" | "email" | "firstName">;

  // Invalida los tokens anteriores que siguieran vivos.
  const { error: invalidateError } = await supabase
    .from("password_reset_tokens")
    .update({ usedAt: new Date().toISOString() })
    .eq("userId", account.id)
    .is("usedAt", null);
  if (invalidateError) {
    console.error("Failed to invalidate old tokens:", invalidateError);
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  const { error: insertError } = await supabase
    .from("password_reset_tokens")
    .insert({
      token,
      email: account.email,
      userId: account.id,
      expiresAt: expiresAt.toISOString(),
    });

  if (insertError) {
    console.error("Failed to create reset token:", insertError);
    return genericResponse;
  }

  const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

  try {
    const { sendPasswordResetEmail } = await import("@/lib/email");
    await sendPasswordResetEmail({
      to: account.email,
      firstName: account.firstName,
      resetUrl,
    });
  } catch (e) {
    console.error("Failed to send reset email:", e);
  }

  return genericResponse;
}

// ─── Reset Password ───────────────────────────────────────────────────────────
export async function resetPassword(token: string, newPassword: string) {
  const { data, error } = await supabase
    .from("password_reset_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    console.error("Failed to look up reset token:", error);
    return { error: "No se pudo validar el enlace. Inténtalo de nuevo." };
  }
  if (!data) return { error: "Token inválido o expirado." };

  const resetToken = data as PasswordResetToken;

  if (resetToken.usedAt) return { error: "Este enlace ya fue utilizado." };
  // expiresAt llega como cadena ISO desde PostgREST: hay que construir un Date
  // antes de comparar, o la comparación daría siempre false.
  if (Date.now() > toDate(resetToken.expiresAt).getTime()) {
    return { error: "El enlace ha expirado. Solicita uno nuevo." };
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  const { error: updateError } = await supabase
    .from("users")
    .update({ password: hashed })
    .eq("id", resetToken.userId);

  if (updateError) {
    console.error("Failed to reset password:", updateError);
    return { error: "No se pudo restablecer la contraseña." };
  }

  const { error: consumeError } = await supabase
    .from("password_reset_tokens")
    .update({ usedAt: new Date().toISOString() })
    .eq("token", token);
  if (consumeError) console.error("Failed to consume token:", consumeError);

  return {
    success: "Contraseña restablecida exitosamente. Puedes iniciar sesión.",
  };
}

// ─── Mark notification as read ────────────────────────────────────────────────
export async function markNotificationRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  // El filtro por userId evita que alguien marque notificaciones ajenas.
  const { error } = await supabase
    .from("notifications")
    .update({ isRead: true })
    .eq("id", notificationId)
    .eq("userId", session.user.id);

  if (error) {
    console.error("Failed to mark notification read:", error);
    return { error: "No se pudo actualizar la notificación." };
  }

  revalidatePath("/notificaciones");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  const { error } = await supabase
    .from("notifications")
    .update({ isRead: true })
    .eq("userId", session.user.id)
    .eq("isRead", false);

  if (error) {
    console.error("Failed to mark notifications read:", error);
    return { error: "No se pudieron actualizar las notificaciones." };
  }

  revalidatePath("/notificaciones");
  revalidatePath("/dashboard");
  return { success: true };
}

// ─── Submit contact form ──────────────────────────────────────────────────────
export async function submitContactMessage(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const { error } = await supabase.from("contact_messages").insert({
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    subject: data.subject,
    message: data.message,
  });

  if (error) {
    console.error("Failed to save contact message:", error);
    return { error: "No se pudo enviar el mensaje. Inténtalo de nuevo." };
  }

  return { success: "Mensaje enviado exitosamente. Te contactaremos pronto." };
}
