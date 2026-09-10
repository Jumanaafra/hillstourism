import type { Metadata } from 'next'
import { Sora, Inter } from 'next/font/google'
import '../index.css'
import { getSiteUrl } from '@/lib/seo/siteUrl'
import { resolvePageMetadata } from '@/lib/seo/metadataHelper'

// ── Self-hosted Google Fonts via next/font ────────────────────────────────────
// Eliminates the render-blocking external fonts.googleapis.com request.
// Next.js downloads and self-hosts font files at build time — zero external DNS.
const sora = Sora({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sora',
  display:  'swap',
  preload:  true,
})

const inter = Inter({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display:  'swap',
  preload:  false, // Sora is the primary brand font; preload only that one
})

const siteUrl = getSiteUrl()

const defaultMeta: Metadata = {
  title: 'Hills Tourism — Premium Mountain Journeys & Curated Hill Escapes',
  description:
    'Discover the hills beyond the ordinary. Handcrafted mountain tours, authentic curated stays, and experienced hill drivers across Munnar, Coorg, Ooty, Shimla, Darjeeling, and Manali.',
  keywords: [
    'Hills Tourism',
    'mountain tours',
    'Munnar packages',
    'Coorg holiday',
    'Ooty trip',
    'Shimla honeymoon',
    'Manali adventure',
    'hill station car rental',
    'curated mountain stays',
  ],
  authors: [{ name: 'Hills Tourism' }],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Hills Tourism — Discover the Hills Beyond the Ordinary',
    description:
      "Cinematic journeys through India's most breathtaking mountains. Curated escapes crafted by local experts who call the hills home.",
    url: siteUrl,
    siteName: 'Hills Tourism',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hills Tourism — Discover the Hills Beyond the Ordinary',
    description: 'Curated mountain escapes crafted by local experts who call the hills home.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata('/', defaultMeta)
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Hills Tourism',
        description: 'Premium Mountain Journeys & Curated Hill Escapes across India',
        inLanguage: 'en-IN',
      },
      {
        '@type': 'TravelAgency',
        '@id': `${siteUrl}/#agency`,
        name: 'Hills Tourism',
        description: 'Enquiry-led curated mountain travel and hill station escapes.',
        url: siteUrl,
        telephone: '+919999000000',
        email: 'hello@hillstourism.com',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'IN',
          addressRegion: 'Tamil Nadu & Kerala',
        },
        areaServed: ['Munnar', 'Coorg', 'Ooty', 'Shimla', 'Darjeeling', 'Manali'],
        priceRange: '₹₹',
      },
    ],
  }

  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  )
}
