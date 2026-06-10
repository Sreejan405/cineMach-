import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: 'CineMatch — AI-Powered Movie Recommendations',
    template: '%s | CineMatch',
  },
  description:
    'Discover your next favorite film with CineMatch. Our AI curates personalized movie recommendations based on your preferred genres, language, and era.',
  keywords: ['movies', 'AI recommendations', 'film discovery', 'movie suggestions', 'TMDB', 'cinematch'],
  authors: [{ name: 'CineMatch' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'CineMatch — AI-Powered Movie Recommendations',
    description: 'Discover your next favorite film with AI-curated movie recommendations.',
    siteName: 'CineMatch',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CineMatch — AI-Powered Movie Recommendations',
    description: 'Discover your next favorite film with AI-curated movie recommendations.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#7c3aed',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
