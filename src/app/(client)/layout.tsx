"use client";

import "../globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";
import Providers from "@/components/providers";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import SideMenu from "@/components/sideMenu";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

const metadata = {
  title: "Interview AI",
  description: "AI-powered Interviews",
  openGraph: {
    title: "Interview AI",
    description: "AI-powered Interviews",
    siteName: "Interview AI",
    images: [
      {
        url: "/Interview ai.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" href="/browser-client-icon.ico" />
      </head>
      <body
        className={cn(
          inter.className,
          "antialiased overflow-hidden min-h-screen",
        )}
      >
        <ClerkProvider
          signInFallbackRedirectUrl={"/dashboard"}
          afterSignOutUrl={"/sign-in"}
        >
          <Providers>
            <div className="flex h-screen">
              {!pathname.includes("/sign-in") &&
                !pathname.includes("/sign-up") && <SideMenu />}
              
              <div className={cn(
                "flex-1 flex flex-col overflow-hidden",
                !pathname.includes("/sign-in") && !pathname.includes("/sign-up") 
                  ? "ml-16" : ""
              )}>
                {!pathname.includes("/sign-in") &&
                  !pathname.includes("/sign-up") && <Navbar />}
                
                <main className="flex-1 overflow-auto">
                  {children}
                </main>
              </div>
            </div>
            <Toaster />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
