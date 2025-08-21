import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../hooks/useAuth';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RestaurantOS - Enterprise Restaurant Management',
  description: 'Complete enterprise SaaS solution for restaurant management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{ duration: 4000 }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}