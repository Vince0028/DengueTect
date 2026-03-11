import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import "./globals.css";
export const metadata = {
    title: "v0 App",
    description: "Created with v0",
    generator: "v0.app",
};
export default function RootLayout({ children, }) {
    return (<html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>);
}
