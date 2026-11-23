import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import { WelcomePanel } from "./components/welcome-panel";

import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-svh">
        <div className="grid min-h-svh grid-rows-[auto_1fr] bg-card lg:grid-cols-[minmax(0,7fr)_minmax(0,11fr)] lg:grid-rows-[auto]">
          <WelcomePanel />
          <main className="flex min-w-0 items-start justify-center px-6 py-10 sm:items-center sm:px-10 sm:py-14 lg:px-20 lg:py-10.5">
            {children}
          </main>
        </div>
        <Toaster
          position="top-right"
          offset={24}
          mobileOffset={16}
          className="toaster group min-[601px]:[--width:420px]!"
        />
      </body>
    </html>
  );
}
