import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EVENTFLOW — Enterprise Event Intelligence & Pipeline Acceleration",
  description: "Unified enterprise event lifecycle, attendee intelligence, CRM alignment, and pipeline attribution platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-[#090D14]">
      <body className="h-full bg-[#090D14] text-[#EAF0F8] antialiased selection:bg-[#3987F5]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
