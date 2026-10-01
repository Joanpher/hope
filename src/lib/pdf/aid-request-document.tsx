import {
  Document,
  Image,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import fs from "node:fs";
import path from "node:path";
import {
  AID_TYPE_LABELS,
  EMPLOYMENT_STATUS_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import { getCountryName } from "@/lib/countries";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AidRequestStatus, AidRequestWithRelations } from "@/types/database";

const APP_NAME = process.env.APP_NAME ?? "HopeRise Foundation";

// Paleta del sitio, para que el documento se lea como parte de la marca.
const NAVY = "#0e2f52";
const LEAF = "#0b7a57";
const INK = "#1b2a3a";
const INK_MUTED = "#52606e";
const LINE = "#dce3e8";
const MIST = "#f2f5f7";

/**
 * Los binarios del logo se leen del disco una sola vez por instancia.
 *
 * `next.config.ts` fuerza su inclusión en el bundle de esta ruta
 * (`outputFileTracingIncludes`): en un despliegue serverless la carpeta
 * `public/` no viaja con la función, y sin esa opción el documento saldría
 * sin logo solo en producción.
 */
type Logos = { mark: Buffer; horizontal: Buffer } | null;

let logoCache: Logos | undefined;

/**
 * Devuelve `null` si los PNG no están donde se esperan. El acta se emite igual,
 * con el nombre de la fundación en texto: un adorno que no se pudo leer no es
 * motivo para dejar a nadie sin su documento.
 */
function getLogos(): Logos {
  if (logoCache === undefined) {
    const dir = path.join(process.cwd(), "public", "brand");
    try {
      logoCache = {
        mark: fs.readFileSync(path.join(dir, "logo-mark.png")),
        horizontal: fs.readFileSync(path.join(dir, "logo-horizontal.png")),
      };
    } catch (e) {
      console.error(`[acta] no se pudieron leer los logos desde ${dir}:`, e);
      logoCache = null;
    }
  }
  return logoCache;
}

/** Estados en los que la ayuda ya está concedida y el acta puede afirmarlo. */
const GRANTED: AidRequestStatus[] = ["APPROVED", "PREPARING", "DELIVERED"];
const CLOSED: AidRequestStatus[] = ["REJECTED", "CANCELLED"];

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 72,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: INK,
    lineHeight: 1.5,
  },

  // Marca de agua: va primero en el árbol para que el texto se dibuje encima.
  watermark: {
    position: "absolute",
    bottom: 70,
    left: 176,
    width: 240,
    height: 240,
    opacity: 0.05,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: NAVY,
    paddingBottom: 12,
    marginBottom: 22,
  },
  logo: { width: 132 },
  logoFallback: { fontFamily: "Times-Bold", fontSize: 15, color: NAVY },
  headerMeta: { alignItems: "flex-end" },
  headerMetaLabel: { fontSize: 7, color: INK_MUTED, letterSpacing: 1 },
  headerMetaCode: {
    fontFamily: "Courier-Bold",
    fontSize: 12,
    color: NAVY,
    marginTop: 2,
  },

  title: {
    fontFamily: "Times-Bold",
    fontSize: 17,
    color: NAVY,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  titleRule: {
    alignSelf: "center",
    width: 56,
    height: 2,
    backgroundColor: LEAF,
    marginTop: 8,
    marginBottom: 6,
  },
  titleNote: {
    textAlign: "center",
    fontSize: 8.5,
    color: INK_MUTED,
    marginBottom: 20,
  },

  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: NAVY,
    letterSpacing: 1.1,
    borderLeftWidth: 3,
    borderLeftColor: LEAF,
    paddingLeft: 7,
    marginTop: 16,
    marginBottom: 9,
  },

  grid: { flexDirection: "row", flexWrap: "wrap" },
  field: { width: "50%", paddingRight: 12, marginBottom: 9 },
  fieldWide: { width: "100%", paddingRight: 12, marginBottom: 9 },
  fieldLabel: { fontSize: 7, color: INK_MUTED, letterSpacing: 0.6 },
  fieldValue: { fontSize: 10, color: INK, fontFamily: "Helvetica-Bold" },

  clause: {
    backgroundColor: MIST,
    borderLeftWidth: 3,
    borderLeftColor: NAVY,
    padding: 14,
    marginTop: 4,
    fontSize: 10.5,
    lineHeight: 1.65,
    textAlign: "justify",
  },

  quote: {
    borderWidth: 1,
    borderColor: LINE,
    padding: 11,
    marginBottom: 9,
    fontSize: 9.5,
    lineHeight: 1.6,
    textAlign: "justify",
    color: INK,
  },

  term: { flexDirection: "row", marginBottom: 5 },
  termNumber: {
    width: 16,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: LEAF,
  },
  termText: { flex: 1, fontSize: 9, lineHeight: 1.55, textAlign: "justify" },

  signatureRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 26,
  },
  signatureBlock: { width: 230, alignItems: "center" },
  signatureLine: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: NAVY,
    marginTop: 2,
    marginBottom: 6,
  },
  signatureName: { fontFamily: "Times-Bold", fontSize: 11, color: NAVY },
  signatureRole: { fontSize: 8, color: INK_MUTED, marginTop: 1 },

  place: { fontSize: 9, color: INK_MUTED, marginTop: 22 },

  // El pie son tres elementos sueltos y fijos, no un contenedor con borde.
  // En este documento @react-pdf descarta un View fijo y posicionado que tenga
  // texto dentro, y el `render` dinámico (la numeración "página X de Y")
  // tampoco llega a pintarse; el expediente va repetido en cada página, que es
  // lo que importa para identificar las hojas sueltas de un acta.
  footerRule: {
    position: "absolute",
    bottom: 44,
    left: 48,
    right: 48,
    height: 1,
    backgroundColor: LINE,
  },
  footerLeft: {
    position: "absolute",
    bottom: 30,
    left: 48,
    fontSize: 7,
    color: INK_MUTED,
  },
  footerRight: {
    position: "absolute",
    bottom: 30,
    right: 48,
    fontSize: 7,
    color: INK_MUTED,
  },
});

/**
 * Título de sección. `minPresenceAhead` reserva espacio por delante: sin él,
 * un título puede quedarse solo al final de una página con su contenido ya en
 * la siguiente.
 */
function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={styles.sectionTitle} minPresenceAhead={70}>
      {children}
    </Text>
  );
}

function Field({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <View style={wide ? styles.fieldWide : styles.field}>
      <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.fieldValue}>{value || "—"}</Text>
    </View>
  );
}

/**
 * Cuerpo del acta. El texto cambia según el estado: afirmar que "se destina
 * esta ayuda" en una solicitud rechazada o todavía en evaluación convertiría
 * el documento en una constancia falsa.
 */
function objectClause(request: AidRequestWithRelations): string {
  const name = `${request.user.firstName} ${request.user.lastName}`;
  const aid = AID_TYPE_LABELS[request.aidType];
  const amount =
    request.requestedAmount != null
      ? ` por un monto de ${formatCurrency(Number(request.requestedAmount))} USD`
      : "";

  if (GRANTED.includes(request.status)) {
    return (
      `Por medio del presente documento, ${APP_NAME} hace constar que se destina a ` +
      `${name}, portador(a) del documento de identidad ${request.user.documentId}, ` +
      `una ayuda de tipo ${aid}${amount}, aprobada en el marco de sus programas de ` +
      `asistencia humanitaria y registrada bajo el expediente ${request.code}. ` +
      `La ayuda se concede para atender la necesidad expuesta por el solicitante y ` +
      `descrita en el apartado de motivo de este documento.`
    );
  }

  if (request.status === "REJECTED") {
    return (
      `Por medio del presente documento, ${APP_NAME} hace constar que la solicitud ` +
      `de ayuda registrada por ${name}, portador(a) del documento de identidad ` +
      `${request.user.documentId}, bajo el expediente ${request.code}, fue evaluada ` +
      `por el equipo de la fundación y no resultó aprobada en esta ocasión. Este ` +
      `documento acredita la gestión realizada y no constituye una asignación de ayuda.`
    );
  }

  if (request.status === "CANCELLED") {
    return (
      `Por medio del presente documento, ${APP_NAME} hace constar que la solicitud ` +
      `de ayuda registrada por ${name}, portador(a) del documento de identidad ` +
      `${request.user.documentId}, bajo el expediente ${request.code}, fue cancelada ` +
      `y no continuará su tramitación. Este documento acredita la gestión realizada ` +
      `y no constituye una asignación de ayuda.`
    );
  }

  return (
    `Por medio del presente documento, ${APP_NAME} hace constar que ${name}, ` +
    `portador(a) del documento de identidad ${request.user.documentId}, ha registrado ` +
    `una solicitud de ayuda de tipo ${aid}${amount}, identificada con el expediente ` +
    `${request.code} y actualmente en estado "${STATUS_LABELS[request.status]}". ` +
    `Este documento acredita la recepción de la solicitud y no constituye todavía ` +
    `una asignación de ayuda.`
  );
}

function terms(granted: boolean): string[] {
  const common = [
    `El solicitante declara que la información consignada en este documento es veraz y que ` +
      `los datos aportados corresponden a su situación real al momento del registro.`,
    `${APP_NAME} podrá solicitar documentación adicional para verificar la situación ` +
      `expuesta, así como realizar visitas de seguimiento.`,
    `Los datos personales recogidos se tratan conforme a la política de privacidad de ` +
      `${APP_NAME} y se utilizan únicamente para gestionar esta solicitud.`,
  ];

  if (!granted) return common;

  return [
    `La ayuda concedida es personal e intransferible, y se destina exclusivamente al fin ` +
      `descrito en este documento.`,
    ...common,
    `La entrega de la ayuda queda sujeta a la disponibilidad de los recursos de la ` +
      `fundación y a la coordinación previa con el beneficiario.`,
  ];
}

export function AidRequestDocument({
  request,
  issuedAt,
}: {
  request: AidRequestWithRelations;
  issuedAt: Date;
}) {
  const logos = getLogos();
  const granted = GRANTED.includes(request.status);
  const closed = CLOSED.includes(request.status);
  const title = granted ? "ACTA DE ASIGNACIÓN DE AYUDA" : "CONSTANCIA DE SOLICITUD";
  const fullName = `${request.user.firstName} ${request.user.lastName}`;

  return (
    <Document
      title={`${title} ${request.code}`}
      author={APP_NAME}
      subject={`Expediente ${request.code}`}
    >
      <Page size="A4" style={styles.page}>
        {logos && (
          <Image fixed style={styles.watermark} src={{ data: logos.mark, format: "png" }} />
        )}

        <View style={styles.header} fixed>
          {logos ? (
            <Image style={styles.logo} src={{ data: logos.horizontal, format: "png" }} />
          ) : (
            <Text style={styles.logoFallback}>{APP_NAME}</Text>
          )}
          <View style={styles.headerMeta}>
            <Text style={styles.headerMetaLabel}>EXPEDIENTE</Text>
            <Text style={styles.headerMetaCode}>{request.code}</Text>
            <Text style={{ fontSize: 7.5, color: INK_MUTED, marginTop: 3 }}>
              Emitido el {formatDate(issuedAt)}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>
        <View style={styles.titleRule} />
        <Text style={styles.titleNote}>
          Estado actual del expediente: {STATUS_LABELS[request.status]}
        </Text>

        <SectionTitle>I. DATOS DEL SOLICITANTE</SectionTitle>
        <View style={styles.grid}>
          <Field label="Nombre completo" value={fullName} />
          <Field label="Documento de identidad" value={request.user.documentId} />
          <Field label="Correo electrónico" value={request.user.email} />
          <Field label="Teléfono" value={request.contactPhone ?? request.user.phone ?? ""} />
          <Field label="País" value={getCountryName(request.user.country)} />
          <Field
            label="Ciudad / Provincia"
            value={[request.user.city, request.user.province].filter(Boolean).join(", ")}
          />
          <Field
            label="Dirección"
            value={request.contactAddress ?? request.user.address ?? ""}
            wide
          />
        </View>

        <SectionTitle>II. DATOS DE LA SOLICITUD</SectionTitle>
        <View style={styles.grid}>
          <Field label="Tipo de ayuda" value={AID_TYPE_LABELS[request.aidType]} />
          <Field label="Fecha de registro" value={formatDate(request.createdAt)} />
          <Field
            label="Monto solicitado"
            value={
              request.requestedAmount != null
                ? `${formatCurrency(Number(request.requestedAmount))} USD`
                : "No especificado"
            }
          />
          <Field
            label="Personas en el hogar"
            value={request.householdSize != null ? String(request.householdSize) : ""}
          />
          <Field
            label="Situación laboral"
            value={
              request.employmentStatus
                ? EMPLOYMENT_STATUS_LABELS[request.employmentStatus]
                : ""
            }
          />
          <Field
            label="Ingresos mensuales"
            value={
              request.monthlyIncome != null
                ? `${formatCurrency(Number(request.monthlyIncome))} USD`
                : ""
            }
          />
        </View>

        <SectionTitle>III. OBJETO</SectionTitle>
        <Text style={styles.clause}>{objectClause(request)}</Text>

        <SectionTitle>IV. SITUACIÓN EXPUESTA</SectionTitle>
        {request.description.trim() ? (
          <Text style={styles.quote}>{request.description}</Text>
        ) : (
          <Text style={styles.quote}>
            El solicitante no detalló su situación en el formulario.
          </Text>
        )}
        {request.reason.trim() ? (
          <>
            <Text style={{ ...styles.fieldLabel, marginBottom: 3 }}>MOTIVO</Text>
            <Text style={styles.quote}>{request.reason}</Text>
          </>
        ) : null}
        {request.observations ? (
          <>
            <Text style={{ ...styles.fieldLabel, marginBottom: 3 }}>OBSERVACIONES</Text>
            <Text style={styles.quote}>{request.observations}</Text>
          </>
        ) : null}

        <View wrap={false}>
          <SectionTitle>{`V. ${granted ? "CONDICIONES" : "DISPOSICIONES"}`}</SectionTitle>
          {terms(granted).map((text, i) => (
            <View key={i} style={styles.term}>
              <Text style={styles.termNumber}>{i + 1}.</Text>
              <Text style={styles.termText}>{text}</Text>
            </View>
          ))}

          <Text style={styles.place}>
            Expedido por {APP_NAME} el {formatDate(issuedAt)}
            {closed ? "." : ", para los fines que al interesado convengan."}
          </Text>

          <View style={styles.signatureRow}>
            <View style={styles.signatureBlock}>
              {/* Rúbrica institucional decorativa: no reproduce la firma de
                  ninguna persona concreta. */}
              <Svg width={170} height={44} viewBox="0 0 170 44">
                <Path
                  d="M6 32 C 20 8, 33 5, 39 15 C 45 25, 34 39, 28 35 C 22 31, 31 17, 48 15 C 65 13, 71 30, 84 30 C 97 30, 99 13, 112 13 C 125 13, 120 32, 133 29 C 144 27, 152 19, 160 10"
                  stroke={NAVY}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  fill="none"
                />
                <Path
                  d="M38 38 C 70 34, 120 34, 150 37"
                  stroke={LEAF}
                  strokeWidth={0.9}
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>{APP_NAME}</Text>
              <Text style={styles.signatureRole}>Dirección de Programas Sociales</Text>
            </View>
          </View>
        </View>

        <View fixed style={styles.footerRule} />
        <Text fixed style={styles.footerLeft}>
          {APP_NAME} · Expediente {request.code}
        </Text>
        <Text fixed style={styles.footerRight}>
          Documento generado el {formatDate(issuedAt)}
        </Text>
      </Page>
    </Document>
  );
}

/** Renderiza el acta y devuelve el PDF listo para enviar en la respuesta. */
export function renderAidRequestDocument(
  request: AidRequestWithRelations,
  issuedAt: Date = new Date()
): Promise<Buffer> {
  return renderToBuffer(<AidRequestDocument request={request} issuedAt={issuedAt} />);
}
