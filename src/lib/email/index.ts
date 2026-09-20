import { Resend } from "resend";
import type { AidRequestStatus, AidType } from "@/types/database";
import { AID_TYPE_LABELS, STATUS_LABELS } from "@/lib/constants";

const FROM = process.env.EMAIL_FROM ?? "HopeRise Foundation <noreply@hoperisefoundation.org>";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const APP_NAME = process.env.APP_NAME ?? "HopeRise Foundation";

/**
 * Cliente de Resend creado bajo demanda.
 *
 * `new Resend(key)` lanza "Missing API key" si la clave falta o está vacía. Al
 * construirlo en el cuerpo del módulo, esa excepción saltaba durante el import
 * y tumbaba cualquier página o Server Action que dependiera de este archivo —
 * el registro de usuarios, por ejemplo — aunque no llegara a enviarse ningún
 * correo. Creándolo dentro de la función, sin clave simplemente no se envía
 * nada y el resto de la aplicación sigue funcionando.
 */
let client: Resend | null = null;

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

/** True si hay clave configurada y, por tanto, se pueden enviar correos. */
export function isEmailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

type Message = { to: string; subject: string; html: string };

/**
 * Envía un correo, o lo omite con un aviso en consola si no hay clave.
 * Todas las funciones de este módulo pasan por aquí.
 */
async function deliver({ to, subject, html }: Message) {
  const resend = getClient();

  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY no configurada: se omite el envío "${subject}" a ${to}.`
    );
    return { skipped: true as const };
  }

  const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });

  if (error) {
    // Se registra y se propaga: quien llama ya envuelve el envío en try/catch
    // para que un fallo de correo no invalide la operación de negocio.
    console.error(`[email] Falló el envío "${subject}" a ${to}:`, error);
    throw new Error(error.message);
  }

  return { skipped: false as const, id: data?.id };
}

// ─── Base HTML Email Template ─────────────────────────────────────────────────
function baseTemplate(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a56db 0%,#0e9f6e 100%);padding:36px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;letter-spacing:-0.5px;">🤝 ${APP_NAME}</h1>
              <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">${title}</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#64748b;font-size:13px;">Este correo fue enviado por <strong>${APP_NAME}</strong>.</p>
              <p style="margin:8px 0 0;color:#94a3b8;font-size:12px;">Si tienes preguntas, contáctanos en <a href="mailto:info@hoperisefoundation.org" style="color:#1a56db;">info@hoperisefoundation.org</a></p>
              <p style="margin:8px 0 0;color:#94a3b8;font-size:11px;">© ${new Date().getFullYear()} ${APP_NAME}. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(text: string, url: string): string {
  return `<div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="background:linear-gradient(135deg,#1a56db,#0e9f6e);color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">
      ${text}
    </a>
  </div>`;
}

// ─── Welcome Email ─────────────────────────────────────────────────────────────
export async function sendWelcomeEmail({
  to,
  firstName,
}: {
  to: string;
  firstName: string;
}) {
  const content = `
    <h2 style="color:#1e293b;margin:0 0 16px;font-size:22px;">¡Bienvenido/a, ${firstName}! 🎉</h2>
    <p style="color:#475569;line-height:1.7;margin:0 0 16px;">Tu cuenta en <strong>${APP_NAME}</strong> ha sido creada exitosamente. Estamos felices de tenerte con nosotros.</p>
    <p style="color:#475569;line-height:1.7;margin:0 0 24px;">Ahora puedes iniciar sesión y solicitar la ayuda que necesites. Nuestro equipo revisará cada caso con dedicación.</p>
    ${button("Ir a mi cuenta", `${APP_URL}/dashboard`)}
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-top:24px;">
      <p style="margin:0;color:#166534;font-size:14px;">💚 <strong>¿Necesitas ayuda?</strong> Puedes crear tu primera solicitud desde tu panel personal.</p>
    </div>
  `;
  return deliver({
    to,
    subject: `¡Bienvenido/a a ${APP_NAME}!`,
    html: baseTemplate(`¡Bienvenido/a a ${APP_NAME}!`, content),
  });
}

// ─── Request Confirmation Email ───────────────────────────────────────────────
export async function sendAidRequestConfirmationEmail({
  to,
  firstName,
  code,
  aidType,
  createdAt,
}: {
  to: string;
  firstName: string;
  code: string;
  aidType: AidType;
  createdAt: Date;
}) {
  const content = `
    <h2 style="color:#1e293b;margin:0 0 16px;font-size:22px;">Hemos recibido tu solicitud 📋</h2>
    <p style="color:#475569;line-height:1.7;margin:0 0 20px;">Hola <strong>${firstName}</strong>, tu solicitud de ayuda ha sido registrada correctamente en nuestro sistema.</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:24px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Código de solicitud</td><td style="padding:8px 0;text-align:right;"><strong style="color:#1a56db;font-size:16px;font-family:monospace;">${code}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-size:14px;border-top:1px solid #f1f5f9;">Tipo de ayuda</td><td style="padding:8px 0;text-align:right;border-top:1px solid #f1f5f9;"><strong style="color:#1e293b;">${AID_TYPE_LABELS[aidType]}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-size:14px;border-top:1px solid #f1f5f9;">Estado inicial</td><td style="padding:8px 0;text-align:right;border-top:1px solid #f1f5f9;"><span style="background:#dbeafe;color:#1e40af;padding:3px 10px;border-radius:20px;font-size:13px;">Solicitud recibida</span></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;font-size:14px;border-top:1px solid #f1f5f9;">Fecha de registro</td><td style="padding:8px 0;text-align:right;border-top:1px solid #f1f5f9;color:#1e293b;">${new Intl.DateTimeFormat("es-ES",{dateStyle:"long"}).format(createdAt)}</td></tr>
      </table>
    </div>
    <p style="color:#475569;line-height:1.7;margin:0 0 24px;">Nuestro equipo revisará tu solicitud y te mantendrá informado/a sobre el progreso. Puedes consultar el estado en cualquier momento desde tu cuenta.</p>
    ${button("Consultar mi solicitud", `${APP_URL}/solicitudes`)}
  `;
  return deliver({
    to,
    subject: `Hemos recibido tu solicitud ${code} | ${APP_NAME}`,
    html: baseTemplate("Solicitud recibida", content),
  });
}

// ─── Status Change Email ──────────────────────────────────────────────────────
export async function sendStatusChangeEmail({
  to,
  firstName,
  code,
  previousStatus,
  newStatus,
  userComment,
}: {
  to: string;
  firstName: string;
  code: string;
  previousStatus: AidRequestStatus;
  newStatus: AidRequestStatus;
  userComment: string;
}) {
  const isApproved = newStatus === "APPROVED";
  const isDelivered = newStatus === "DELIVERED";
  const isRejected = newStatus === "REJECTED";

  const headerIcon = isApproved ? "✅" : isDelivered ? "🎉" : isRejected ? "❌" : "🔔";

  const content = `
    <h2 style="color:#1e293b;margin:0 0 16px;font-size:22px;">${headerIcon} Actualización de tu solicitud</h2>
    <p style="color:#475569;line-height:1.7;margin:0 0 20px;">Hola <strong>${firstName}</strong>, el estado de tu solicitud <strong style="color:#1a56db;font-family:monospace;">${code}</strong> ha sido actualizado.</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:24px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:10px 0;color:#64748b;font-size:14px;">Estado anterior</td>
          <td style="padding:10px 0;text-align:right;"><span style="background:#f1f5f9;color:#475569;padding:3px 10px;border-radius:20px;font-size:13px;">${STATUS_LABELS[previousStatus]}</span></td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#64748b;font-size:14px;border-top:1px solid #f1f5f9;">Nuevo estado</td>
          <td style="padding:10px 0;text-align:right;border-top:1px solid #f1f5f9;"><span style="background:${isApproved||isDelivered ? "#dcfce7" : isRejected ? "#fee2e2" : "#dbeafe"};color:${isApproved||isDelivered ? "#166534" : isRejected ? "#991b1b" : "#1e40af"};padding:3px 10px;border-radius:20px;font-size:13px;font-weight:600;">${STATUS_LABELS[newStatus]}</span></td>
        </tr>
      </table>
    </div>
    ${userComment ? `<div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:0 8px 8px 0;padding:16px;margin:20px 0;"><p style="margin:0;color:#166534;font-size:14px;line-height:1.6;"><strong>Mensaje de la fundación:</strong><br/>${userComment}</p></div>` : ""}
    ${button("Ver detalles de mi solicitud", `${APP_URL}/solicitudes`)}
  `;

  return deliver({
    to,
    subject: `Actualización de tu solicitud ${code} | ${APP_NAME}`,
    html: baseTemplate(`Actualización: ${STATUS_LABELS[newStatus]}`, content),
  });
}

// ─── Password Reset Email ─────────────────────────────────────────────────────
export async function sendPasswordResetEmail({
  to,
  firstName,
  resetUrl,
}: {
  to: string;
  firstName: string;
  resetUrl: string;
}) {
  const content = `
    <h2 style="color:#1e293b;margin:0 0 16px;font-size:22px;">Recuperación de contraseña 🔐</h2>
    <p style="color:#475569;line-height:1.7;margin:0 0 16px;">Hola <strong>${firstName}</strong>, recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
    <p style="color:#475569;line-height:1.7;margin:0 0 24px;">Haz clic en el botón a continuación para crear una nueva contraseña. Este enlace expirará en <strong>1 hora</strong>.</p>
    ${button("Restablecer contraseña", resetUrl)}
    <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:14px;margin-top:24px;">
      <p style="margin:0;color:#854d0e;font-size:13px;">⚠️ Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no será modificada.</p>
    </div>
  `;
  return deliver({
    to,
    subject: `Recuperación de contraseña | ${APP_NAME}`,
    html: baseTemplate("Recuperación de contraseña", content),
  });
}
