import "./globals.css";

import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "The Strategy Council",
  description: "Local-first multi-agent strategy debate workspace",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
