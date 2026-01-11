import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SheetGrade - Sistema de Correção de Provas",
  description: "Sistema para correção automatizada de avaliações escolares",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <QueryProvider>
          <ToastProvider>
            <div className="min-h-screen">
              <Sidebar />
              <main className="lg:pl-64">{children}</main>
            </div>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
