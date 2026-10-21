import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

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
        {children}
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
