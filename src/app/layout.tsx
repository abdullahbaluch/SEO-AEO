import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'SEO Toolkit - On-page SEO & AEO Analysis',
  description: 'Comprehensive SEO and Answer Engine Optimization toolkit with integrated marketing team management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
