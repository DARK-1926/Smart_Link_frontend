import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { ToastProvider } from '@/components/toast';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const sans = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

const mono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'SmartHub - IIT Ropar TechFest 2026',
  description: 'Build adaptive link hubs for IIT Ropar TechFest 2026. Highlight the right link for each visitor with simple rules.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="theme-dark">
      <body className={`${sans.variable} ${mono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
