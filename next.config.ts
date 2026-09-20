import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // `experimental.serverActions.allowedOrigins` estaba fijado a
  // ["localhost:3000"]. Esa opción añade orígenes permitidos ADEMÁS del propio
  // dominio, así que en producción habría aceptado Server Actions invocadas
  // desde una página servida en localhost:3000 de la máquina de la víctima.
  // Sin la opción, Next solo acepta el mismo origen, que es lo correcto tanto
  // en local como en Vercel.
};

export default nextConfig;
