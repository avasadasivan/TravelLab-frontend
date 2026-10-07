import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TravelLab · Plan trips together",
  description:
    "A real-time collaborative trip planner: build an itinerary with friends and see every change instantly.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-600 text-white">
                ✈
              </span>
              <span className="text-lg tracking-tight">TravelLab</span>
            </Link>
            <span className="hidden text-sm text-slate-500 sm:block">
              Plan trips together, in real time
            </span>
          </div>
        </header>

        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </div>

        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          Built with Next.js, NestJS, Socket.IO and PostgreSQL ·{" "}
          <a
            href="https://github.com/avasadasivan/TravelLab-backend"
            className="underline hover:text-slate-700"
          >
            Source on GitHub
          </a>
        </footer>
      </body>
    </html>
  );
}
