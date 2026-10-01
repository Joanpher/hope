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
  // se empaqueta por separado, así que ambas necesitan los mismos archivos.
  //
  //  - Los PNG del logo, que se leen con `fs`.
  //  - Las métricas de las fuentes estándar de pdfkit. `pdfkit` las carga con
  //    un `require` cuya ruta se arma en tiempo de ejecución, así que el
  //    trazado de Next no las ve y la función se desplegaba sin ellas: en
  //    local funcionaba y en Vercel reventaba con "Cannot find module
  //    .../standard-fonts/Helvetica.cjs".
  outputFileTracingIncludes: {
    "/api/solicitudes/[id]/documento": [
      "./public/brand/logo-*.png",
      "./node_modules/pdfkit/js/standard-fonts/**",
    ],
    "/solicitudes/nueva": [
      "./public/brand/logo-*.png",
      "./node_modules/pdfkit/js/standard-fonts/**",
    ],
  },
  // `experimental.serverActions.allowedOrigins` estaba fijado a
  // ["localhost:3000"]. Esa opción añade orígenes permitidos ADEMÁS del propio
  // dominio, así que en producción habría aceptado Server Actions invocadas
  // desde una página servida en localhost:3000 de la máquina de la víctima.
  // Sin la opción, Next solo acepta el mismo origen, que es lo correcto tanto
  // en local como en Vercel.
};

export default nextConfig;
