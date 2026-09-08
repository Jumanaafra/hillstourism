import type { Metadata } from 'next'
import '../index.css'

export const metadata: Metadata = {
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://hillstourism.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Hills Tourism — Discover the Hills Beyond the Ordinary',
    description:
      'Cinematic journeys through India’s most breathtaking mountains. Curated escapes crafted by local experts who call the hills home.',
    url: 'https://hillstourism.com',
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'Hills Tourism',
    description: 'Enquiry-led curated mountain travel and hill station escapes.',
    url: 'https://hillstourism.com',
    telephone: '+919999000000',
    email: 'hello@hillstourism.com',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
      addressRegion: 'Tamil Nadu & Kerala',
    },
    areaServed: ['Munnar', 'Coorg', 'Ooty', 'Shimla', 'Darjeeling', 'Manali'],
    priceRange: '₹₹',
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
