import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/ui/Sidebar";

export const metadata: Metadata = {
  title: "Company Knowledge Assistant",
  description: "AI-powered internal knowledge assistant with RAG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <Sidebar />
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
