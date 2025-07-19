import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { UserProvider } from '@/context/UserProvider'; // ✅ أضف هذا السطر

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Smart Coin',
  description: 'منصة Smart Coin للتعدين والمكافآت',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${inter.className} bg-background-black text-white min-h-screen`}>
        <UserProvider>
          {children}
        </UserProvider>
        {children}

        {/* JS SYNC Ad 1 */}
        <Script
          strategy="afterInteractive"
          src="//pl27202088.profitableratecpm.com/1c/28/ce/1c28cea4764a32c6ff51305841262340.js"
        />

        {/* SocialBar_1 */}
        <Script
          strategy="afterInteractive"
          src="//pl27202122.profitableratecpm.com/24/3e/ee/243eee94c6a0fa1cf865b310d6ade1eb.js"
        />
      </body>
    </html>
  );
}
