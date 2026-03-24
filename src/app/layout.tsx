import type { Metadata } from 'next';
import './globals.css';
import { Geist, Oswald } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const oswald = Oswald({subsets:['latin'],variable:'--font-display',weight:['400','500','600','700']});

export const metadata: Metadata = {
  title: 'Agile Draft Board',
  description: 'Kanban-style baseball draft board',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("dark font-sans", geist.variable, oswald.variable)}>
      <body className="min-h-screen bg-zinc-900">
        {children}
      </body>
    </html>
  );
}
