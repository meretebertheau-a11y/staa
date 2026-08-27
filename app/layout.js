import { Fraunces, Hanken_Grotesk } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif'
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans'
});

export const metadata = {
  title: 'Ståa',
  description: 'Lagerstyring for vintagebutikker'
};

export default function RootLayout({ children }) {
  return (
    <html lang="no" className={`${fraunces.variable} ${hankenGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
