import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAidRequestById } from "@/server/queries/aid-request";
import { renderAidRequestDocument } from "@/lib/pdf/aid-request-document";

// El PDF se arma con `fs` y fuentes del sistema de @react-pdf: necesita Node,
// no el runtime Edge.
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const request = await getAidRequestById(id);
  if (!request) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }

  // El middleware no cubre /api, así que la comprobación de propiedad se hace
  // aquí: sin ella, cualquier sesión podría descargar el expediente ajeno
  // probando identificadores.
  const isOwner = request.userId === session.user.id;
  if (!isOwner && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const pdf = await renderAidRequestDocument(request);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="HopeRise-${request.code}.pdf"`,
      // Contiene datos personales: que no quede en cachés compartidas.
      "Cache-Control": "private, no-store",
    },
  });
}
