'use client';
import { Outfit } from 'next/font/google';
import '@/app/globals.css';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthTokenProvider, useAuthToken } from '@/context/AuthContext';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";


const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <AuthTokenProvider>
          <ThemeProvider>
            <QueryClientProvider client={queryClient}>
              <SidebarProvider>{children}</SidebarProvider>
            </QueryClientProvider>
          </ThemeProvider>
          <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
            &copy; {new Date().getFullYear()} - Insoft Research and Development
          </p>
        </AuthTokenProvider>
      </body>
    </html>
  );
}