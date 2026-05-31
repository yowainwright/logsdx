import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "logsDx - Schema-based Styling for Logs",
  description:
    "Make your logs look identical between terminal and browser environments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col font-sans">
        <Providers>
          <div className="flex-1">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
