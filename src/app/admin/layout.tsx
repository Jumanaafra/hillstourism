import type { Metadata } from 'next'
import { AdminThemeProvider } from '@/context/AdminThemeContext'

export const metadata: Metadata = {
  title: 'Admin Portal — Hills Tourism',
  description: 'Hills Tourism administrative portal and content management system.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

// Inline script executed immediately before paint to prevent any theme flash
const antiFlashScript = `
(function() {
  try {
    var saved = localStorage.getItem('hills_admin_theme_pref');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved === 'light' ? 'light' : (saved === 'dark' ? 'dark' : (prefersDark ? 'dark' : 'light'));
    document.documentElement.setAttribute('data-admin-theme', theme);
  } catch (e) {}
})();
`

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        id="admin-anti-flash-script"
        dangerouslySetInnerHTML={{ __html: antiFlashScript }}
      />
      <AdminThemeProvider>
        {children}
      </AdminThemeProvider>
    </>
  )
}
