import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getSiteSettings } from '@/lib/repositories/content.repo'
import { getCanonicalUrl } from '@/lib/seo/siteUrl'
import { resolvePageMetadata } from '@/lib/seo/metadataHelper'
import { blogs } from '@/data/blogs'
import { getOptimizedImageUrl } from '@/lib/cloudinary/transform'

export const revalidate = 3600

const defaultMeta: Metadata = {
  title: 'Travel Blog — Hills Tourism',
  description: 'Read the latest travel guides, tips, and stories about exploring the hill stations of India.',
  alternates: {
    canonical: getCanonicalUrl('/blog'),
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata('/blog', defaultMeta)
}

export default async function BlogPage() {
  const settings = await getSiteSettings().catch(() => null)

  return (
    <>
      <Navbar whatsappUrl={settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}` : undefined} />
      <main style={{ paddingTop: '80px', background: 'var(--hill-surface)', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center', paddingTop: '4rem', paddingBottom: '3rem', paddingInline: '1rem' }}>
          <h1 className="heading-xl" style={{ color: 'var(--hill-navy)' }}>Travel Guides & Stories</h1>
          <p className="body-lg" style={{ color: 'var(--hill-muted)', maxWidth: '600px', margin: '1rem auto 0' }}>
            Discover the best times to visit, hidden gems, and travel tips from our mountain experts.
          </p>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {blogs.map(post => (
            <article key={post.id} className="package-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <Link href={`/blog/${post.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
                <div className="package-card-img" style={{ height: '220px', position: 'relative' }}>
                  <img
                    src={getOptimizedImageUrl(post.image, { width: 600, crop: 'fill' })}
                    alt={post.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--hill-blue)', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    {post.tags[0]}
                  </div>
                </div>
              </Link>
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--hill-muted)', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="heading-sm" style={{ marginBottom: '0.5rem', fontSize: '1.25rem', lineHeight: 1.4 }}>
                  <Link href={`/blog/${post.slug}`} style={{ color: 'var(--hill-navy)', textDecoration: 'none' }}>
                    {post.title}
                  </Link>
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--hill-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {post.excerpt}
                </p>
                <div style={{ marginTop: 'auto' }}>
                  <Link href={`/blog/${post.slug}`} className="footer-link" style={{ color: 'var(--hill-blue-bright)', fontWeight: 600, fontSize: '0.85rem' }}>
                    Read More →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer id="footer" settings={settings} />
    </>
  )
}
