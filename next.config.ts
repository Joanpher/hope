import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // El acta en PDF lee los PNG del logo con `fs`. En un despliegue serverless
  // la carpeta `public/` se sirve como estáticos pero no viaja dentro de la
  // función, así que hay que incluirlos explícitamente o el documento saldría
  // sin logo solo en producción.
  // Hay dos puntos que generan el acta: la ruta de descarga y la Server Action
  // que crea la solicitud (adjunta el PDF al correo de confirmación). Cada una
  // se empaqueta por separado, así que ambas necesitan los PNG declarados.
  outputFileTracingIncludes: {
    "/api/solicitudes/[id]/documento": ["./public/brand/logo-*.png"],
    "/solicitudes/nueva": ["./public/brand/logo-*.png"],
  },
  // `experimental.serverActions.allowedOrigins` estaba fijado a
  // ["localhost:3000"]. Esa opción añade orígenes permitidos ADEMÁS del propio
  // dominio, así que en producción habría aceptado Server Actions invocadas
  // desde una página servida en localhost:3000 de la máquina de la víctima.
  // Sin la opción, Next solo acepta el mismo origen, que es lo correcto tanto
  // en local como en Vercel.
};

export default nextConfig;
