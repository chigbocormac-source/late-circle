import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NavigationWrapper from './components/NavigationWrapper';
import RegisterSW from './components/RegisterSW';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Late Circle',
  description: 'Lifestyle & habit tracker',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Late Circle',
  },
};

export const viewport: Viewport = {
  themeColor: '#FFF0F3',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactNode {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#FFF0F3]`}>
        {children}
        <NavigationWrapper />
        <RegisterSW />
      </body>
    </html>
  );
}