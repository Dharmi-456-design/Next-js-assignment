import type { Metadata } from "next";
import { Navbar } from "../components/layout/Navbar";
import "../globals.css";

export const metadata: Metadata = {
  title: "Workloom — Freelance Business & Project Management",
  description: "Every project. Every client. Everything in sync. Built for independent professionals and creative studios.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#F7F7F4] text-[#20231F] font-sans antialiased">
        <Navbar />
        <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

