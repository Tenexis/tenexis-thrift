import type { Metadata } from "next";
import { DM_Sans, Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/header";
import { SiteFooter } from "@/components/footer";
import { getUser } from "@/lib/get-user";

const outfit = Outfit({ 
  subsets: ['latin'], 
  variable: '--font-outfit' 
});

const dmSans = DM_Sans({ 
  subsets: ['latin'], 
  variable: '--font-sans' 
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tenexis",
  description: "Tenexis, Thrift, Store, and Notes",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`
          ${dmSans.variable} 
          ${outfit.variable} 
          ${geistSans.variable} 
          ${geistMono.variable} 
          antialiased 
          min-h-screen
        `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
            <SiteHeader user={user} />
            <main className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}