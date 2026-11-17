import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NavigationWrapper from './components/NavigationWrapper';
import RegisterSW from './components/RegisterSW';
import InstallHint from './components/InstallHint';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ovi',
  description: 'Lifestyle & habit tracker',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ovi',
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
        <div className="px-4 pt-4 flex justify-center">
          <InstallHint />
        </div>
        {children}
        <NavigationWrapper />
        <RegisterSW />
      </body>
    </html>
  );
}