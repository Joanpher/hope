import { Resend } from "resend";
import type { AidRequestStatus, AidType } from "@/types/database";
import { AID_TYPE_LABELS, STATUS_LABELS } from "@/lib/constants";

const FROM = process.env.EMAIL_FROM ?? "Fundación Esperanza <notificaciones@jofipos.lat>";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const APP_NAME = process.env.APP_NAME ?? "Fundación Esperanza";

/**
 * Dirección de contacto mostrada en el pie de cada correo.
 *
 * Antes estaba fijada a "info@hoperisefoundation.org", un dominio que no
 * existe y no tiene relación alguna con el dominio que realmente envía el
 * correo (jofipos.lat, verificado en Resend). Un pie de página que remite a
 * un dominio ajeno e inexistente es una señal de ilegitimidad para los
 * filtros de spam además de, simplemente, un enlace roto para quien lo lea.
 * Ahora se deriva de la dirección real del remitente en vez de inventar una.
 */
const CONTACT_EMAIL = FROM.match(/<(.+)>/)?.[1] ?? FROM;

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

// ─── Plantilla base ────────────────────────────────────────────────────────────
//
// Principios de diseño, deliberados para no parecer correo masivo/publicitario:
//   - Sin degradados: un único color sólido y discreto, usado con moderación.
//   - Sin emoji, ni en asuntos ni en cuerpo.
//   - Sin bloques de color grandes ni insignias en forma de píldora: el estado
//     se indica con una etiqueta de texto y un borde lateral, no con un fondo
//     saturado — así se lee como una notificación de sistema, no como un banner.
//   - Tipografía y color de texto conservadores (gris oscuro sobre blanco).
//   - Un único enlace de acción por correo, como botón de borde recto y color
//     sólido, no como una píldora redondeada con degradado.

const INK = "#1f2933"; // texto principal
const MUTED = "#5c6570"; // texto secundario
const ACCENT = "#1d4e42"; // verde bosque discreto: un único color de marca
const BORDER = "#e2e5e9";
const SURFACE = "#f6f7f8";

function baseTemplate(preheader: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${APP_NAME}</title>
</head>
<body style="margin:0;padding:0;background:${SURFACE};font-family:Arial,Helvetica,sans-serif;">
  <!-- Preheader: texto que muestran los clientes de correo junto al asunto, oculto en el cuerpo -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:${SURFACE};padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid ${BORDER};max-width:560px;width:100%;">
          <!-- Encabezado: texto sencillo, sin franja de color ni logo decorativo -->
          <tr>
            <td style="padding:28px 32px 20px;border-bottom:1px solid ${BORDER};">
              <span style="color:${INK};font-size:16px;font-weight:700;">${APP_NAME}</span>
            </td>
          </tr>
          <!-- Cuerpo -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Pie -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid ${BORDER};">
              <p style="margin:0;color:${MUTED};font-size:12px;line-height:1.6;">
                Recibes este mensaje porque tienes una cuenta en ${APP_NAME}.
                Si tienes alguna duda, escríbenos a
                <a href="mailto:${CONTACT_EMAIL}" style="color:${ACCENT};">${CONTACT_EMAIL}</a>.
              </p>
              <p style="margin:8px 0 0;color:${MUTED};font-size:11px;">© ${new Date().getFullYear()} ${APP_NAME}</p>
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
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background:${ACCENT};">
        <a href="${url}" style="display:inline-block;padding:12px 24px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">
          ${text}
        </a>
      </td>
    </tr>
  </table>`;
}

/** Etiqueta de texto con borde lateral, en vez de una insignia de color de fondo. */
function tag(label: string, color: string): string {
  return `<span style="border-left:3px solid ${color};padding-left:8px;color:${INK};font-size:14px;font-weight:600;">${label}</span>`;
}

// ─── Correo de bienvenida ──────────────────────────────────────────────────────
export async function sendWelcomeEmail({
  to,
  firstName,
}: {
  to: string;
  firstName: string;
}) {
  const content = `
    <p style="color:${INK};font-size:15px;line-height:1.6;margin:0 0 16px;">Hola ${firstName},</p>
    <p style="color:${INK};font-size:15px;line-height:1.6;margin:0 0 16px;">
      Tu cuenta en ${APP_NAME} quedó creada. Desde tu panel puedes registrar una
      solicitud de ayuda y ver en qué etapa se encuentra cada una.
    </p>
    ${button("Entrar a mi cuenta", `${APP_URL}/dashboard`)}
    <p style="color:${MUTED};font-size:13px;line-height:1.6;margin:8px 0 0;">
      Si no creaste esta cuenta, puedes ignorar este mensaje.
    </p>
  `;
  return deliver({
    to,
    subject: `Tu cuenta en ${APP_NAME} está lista`,
    html: baseTemplate(`Tu cuenta en ${APP_NAME} quedó creada.`, content),
  });
}

// ─── Confirmación de solicitud ─────────────────────────────────────────────────
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
    <p style="color:${INK};font-size:15px;line-height:1.6;margin:0 0 16px;">Hola ${firstName},</p>
    <p style="color:${INK};font-size:15px;line-height:1.6;margin:0 0 20px;">
      Registramos tu solicitud de ayuda con los siguientes datos:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};margin:0 0 20px;">
      <tr>
        <td style="padding:10px 16px;color:${MUTED};font-size:13px;border-bottom:1px solid ${BORDER};">Código</td>
        <td style="padding:10px 16px;text-align:right;font-family:monospace;font-size:14px;color:${INK};border-bottom:1px solid ${BORDER};">${code}</td>
      </tr>
      <tr>
        <td style="padding:10px 16px;color:${MUTED};font-size:13px;border-bottom:1px solid ${BORDER};">Tipo de ayuda</td>
        <td style="padding:10px 16px;text-align:right;font-size:14px;color:${INK};border-bottom:1px solid ${BORDER};">${AID_TYPE_LABELS[aidType]}</td>
      </tr>
      <tr>
        <td style="padding:10px 16px;color:${MUTED};font-size:13px;">Fecha</td>
        <td style="padding:10px 16px;text-align:right;font-size:14px;color:${INK};">${new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(createdAt)}</td>
      </tr>
    </table>
    <p style="color:${INK};font-size:15px;line-height:1.6;margin:0 0 8px;">
      ${tag("Estado actual: Solicitud recibida", ACCENT)}
    </p>
    <p style="color:${INK};font-size:15px;line-height:1.6;margin:16px 0;">
      Un miembro de nuestro equipo revisará el caso. Te avisaremos por este mismo
      medio cada vez que cambie de estado.
    </p>
    ${button("Ver mi solicitud", `${APP_URL}/solicitudes`)}
  `;
  return deliver({
    to,
    subject: `Solicitud ${code} recibida`,
    html: baseTemplate(`Registramos tu solicitud ${code}.`, content),
  });
}

// ─── Cambio de estado ──────────────────────────────────────────────────────────
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
  const isPositive = newStatus === "APPROVED" || newStatus === "DELIVERED";
  const isRejected = newStatus === "REJECTED";
  const statusColor = isPositive ? "#2f6e4a" : isRejected ? "#a33a3a" : ACCENT;

  const content = `
    <p style="color:${INK};font-size:15px;line-height:1.6;margin:0 0 16px;">Hola ${firstName},</p>
    <p style="color:${INK};font-size:15px;line-height:1.6;margin:0 0 20px;">
      El estado de tu solicitud <span style="font-family:monospace;">${code}</span> cambió.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};margin:0 0 20px;">
      <tr>
        <td style="padding:10px 16px;color:${MUTED};font-size:13px;border-bottom:1px solid ${BORDER};">Estado anterior</td>
        <td style="padding:10px 16px;text-align:right;font-size:14px;color:${INK};border-bottom:1px solid ${BORDER};">${STATUS_LABELS[previousStatus]}</td>
      </tr>
      <tr>
        <td style="padding:10px 16px;color:${MUTED};font-size:13px;">Estado actual</td>
        <td style="padding:10px 16px;text-align:right;">${tag(STATUS_LABELS[newStatus], statusColor)}</td>
      </tr>
    </table>
    ${
      userComment
        ? `<p style="color:${INK};font-size:14px;line-height:1.6;margin:0 0 20px;border-left:3px solid ${BORDER};padding-left:12px;">${userComment}</p>`
        : ""
    }
    ${button("Ver detalles de mi solicitud", `${APP_URL}/solicitudes`)}
  `;

  return deliver({
    to,
    subject: `Solicitud ${code}: ${STATUS_LABELS[newStatus]}`,
    html: baseTemplate(`Tu solicitud ${code} cambió a ${STATUS_LABELS[newStatus]}.`, content),
  });
}

// ─── Recuperación de contraseña ────────────────────────────────────────────────
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
    <p style="color:${INK};font-size:15px;line-height:1.6;margin:0 0 16px;">Hola ${firstName},</p>
    <p style="color:${INK};font-size:15px;line-height:1.6;margin:0 0 16px;">
      Recibimos una solicitud para restablecer la contraseña de tu cuenta en ${APP_NAME}.
      El enlace vence en 1 hora.
    </p>
    ${button("Restablecer contraseña", resetUrl)}
    <p style="color:${MUTED};font-size:13px;line-height:1.6;margin:20px 0 0;border-left:3px solid ${BORDER};padding-left:12px;">
      Si no solicitaste este cambio, ignora este mensaje: tu contraseña seguirá siendo la misma.
    </p>
  `;
  return deliver({
    to,
    subject: `Restablece tu contraseña en ${APP_NAME}`,
    html: baseTemplate("Solicitud de restablecimiento de contraseña.", content),
  });
}
