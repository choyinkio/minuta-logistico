import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Permitir siempre el dashboard (como página base) si no está explícitamente en menús
    // Pero si quieres control TOTAL, entonces debe estar en la lista.
    
    const isProtectedPath = path.startsWith("/dashboard") || path.startsWith("/config");
    
    if (isProtectedPath) {
      const permittedPaths = (token?.permittedPaths as string[]);
      
      // Fallback de seguridad: Si el token es antiguo y no tiene 'permittedPaths', 
      // y el usuario es Administrador, lo dejamos pasar temporalmente para que 
      // no tenga que forzar un re-login.
      if (permittedPaths === undefined && token?.profile === "Administrador") {
        return; // Permite continuar
      }

      const pathsToCheck = permittedPaths || [];
      const hasPermission = pathsToCheck.some(p => path === p || path.startsWith(p + "/"));

      // Bypass Maestro para el Administrador
      if (token?.profile === "Administrador") {
        return; // Permitir siempre al Administrador
      }

      if (!hasPermission) {
        return NextResponse.rewrite(new URL("/acceso-denegado", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Requiere estar logueado para todas las rutas que coincidan con el matcher
    },
  }
);

// Matcher para las rutas que queremos proteger
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/config/:path*",
    // Agrega aquí cualquier nueva ruta que deba pasar por la aplicación de roles
  ],
};
