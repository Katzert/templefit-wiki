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
  title: 'TempleFit Wiki - Base de Conocimiento y Guías Operativas',
  description: 'Base de conocimiento, protocolos de entrenamiento y guías operativas de TempleFit.',
  icons: {
    icon: [
      { url: '/templefit-wiki/icon.svg', type: 'image/svg+xml' },
      { url: '/templefit-wiki/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/templefit-wiki/icon.svg',
    apple: '/templefit-wiki/icon.svg'
  }
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
