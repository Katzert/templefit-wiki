import './globals.css';
import { Outfit, Playfair_Display } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata = {
  title: 'TempleFit Wiki - Cerebro & Bóveda de Conocimiento Obsidian',
  description: 'Bóveda descentralizada de conocimiento holístico de TempleFit basada en la especificación Karpathy y Obsidian Graph View.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${outfit.variable} ${playfair.variable}`}>
      <body className="bg-[#05070C] text-white antialiased selection:bg-temple-gold selection:text-black font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
