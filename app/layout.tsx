import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NavigationWrapper from './components/NavigationWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Late Circle',
  description: 'Lifestyle & habit tracker',
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
      </body>
    </html>
  );
}