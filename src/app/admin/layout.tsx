import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Portal — Hills Tourism',
  description: 'Hills Tourism administrative portal and content management system.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
