import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import DashboardLayout from '@/components/layout/DashboardLayout';

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
        <Providers>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </Providers>
      </body>
    </html>
  );
}
