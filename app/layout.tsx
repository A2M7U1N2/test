import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SemesterProvider } from "@/lib/SemesterContext";
import { CalendarProvider } from "@/lib/CalendarContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import { BottomNav } from "@/components/ui/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyOS AI",
  description: "Track your GPA and academic progress",
  manifest: "/manifest.json",
  themeColor: "#ef4444",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StudyOS",
  },
  icons: {
    apple: "/icon-192.png", 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <SemesterProvider>
            <CalendarProvider>
              {children}
              <BottomNav />
            </CalendarProvider>
          </SemesterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}