import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { UserProvider } from '@/context/UserProvider';
import Script from 'next/script'; // ✅ ضروري لإدراج الإعلانات

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Smart Coin',
  description: 'منصة Smart Coin للتعدين والمكافآت',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head />
      <body className={`${inter.className} bg-background-black text-white min-h-screen`}>
        <UserProvider>
          {children}
        </UserProvider>

        {/* ✅ إعلان JS SYNC Ad 1 */}
        
      </body>
    </html>
  );
}
