import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StyledJsxRegistry from "@/lib/registry";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Minuta Logístico | Gestión de Usuarios",
  description: "Sistema moderno de gestión de usuarios y autenticación conectado a SQL Server",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} app-layout`}>
        <StyledJsxRegistry>
          <ClientLayout>
            {children}
          </ClientLayout>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
