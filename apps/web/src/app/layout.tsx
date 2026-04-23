import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import AppShell from "@/components/ui/AppShell";

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
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var saved = localStorage.getItem("company-knowledge-theme");
                var theme = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
                document.documentElement.dataset.theme = theme;
              } catch (error) {}
            })();
          `}
        </Script>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
