import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../providers/ThemeProvider';
import QueryProvider from '../providers/QueryProvider';
import { AuthProvider } from '../providers/AuthProvider';
import { ToastProvider } from '../components/shared/Toast';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ECF3F5' },
    { media: '(prefers-color-scheme: dark)', color: '#0C313A' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://hafalanku.forapp.id'),
  title: {
    default: 'HafalanKu - Manajemen Tahfidz & Murajaah',
    template: '%s | HafalanKu',
  },
  description: 'Aplikasi manajemen hafalan Al-Qur\'an modern dengan notifikasi WhatsApp otomatis untuk wali murid dan ustadz.',
  applicationName: 'HafalanKu',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HafalanKu',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/logo.png', sizes: '1024x1024', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'HafalanKu - Manajemen Tahfidz & Murajaah',
    description: 'Aplikasi manajemen hafalan Al-Qur\'an modern dengan notifikasi WhatsApp otomatis.',
    url: 'https://hafalanku.forapp.id',
    siteName: 'HafalanKu',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HafalanKu - Manajemen Tahfidz & Murajaah',
    description: 'Aplikasi manajemen hafalan Al-Qur\'an modern dengan notifikasi WhatsApp otomatis.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '96kbXzz1KBySpd-ssTyVX3ATgRdcm3gFMe6LpKOJy_s',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground selection:bg-primary/20 selection:text-primary min-h-screen flex flex-col`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <AuthProvider>
              {children}
              <ToastProvider />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
