"use client";
import Providers from "./providers";

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          backgroundImage: "linear-gradient(to top, #aabbb0, #ffffff)",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
