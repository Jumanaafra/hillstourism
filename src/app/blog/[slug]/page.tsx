import { notFound } from 'next'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getSiteSettings } from '@/lib/repositories/content.repo'
import { getCanonicalUrl } from '@/lib/seo/siteUrl'
import { blogs } from '@/data/blogs'
import { getOptimizedImageUrl } from '@/lib/cloudinary/transform'
import Link from 'next/link'

export const revalidate = 3600

export async function generateStaticParams() {
  return blogs.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = blogs.find(p => p.slug === params.slug)
  if (!post) return {}
  
  return {
    title: \`\${post.title} — Hills Tourism Blog\`,
    description: post.excerpt,
    alternates: {
      canonical: getCanonicalUrl(\`/blog/\${post.slug}\`),
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    }
  }
}

export default async function BlogPostPage({ params }) {
  const post = blogs.find(p => p.slug === params.slug)
  if (!post) notFound()

  const settings = await getSiteSettings().catch(() => null)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.image,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: post.author
    },
    publisher: {
      '@type': 'Organization',
      name: 'Hills Tourism',
      logo: {
        '@type': 'ImageObject',
        url: getCanonicalUrl('/logo.png')
      }
    },
    description: post.excerpt
  }

  return (
    <>
      <Navbar whatsappUrl={settings?.whatsappNumber ? \`https://wa.me/\${settings.whatsappNumber.replace(/[^0-9]/g, '')}\` : undefined} />
      <main style={{ background: 'var(--hill-surface)', paddingBottom: '4rem' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        {/* Hero Section */}
        <div style={{ position: 'relative', width: '100%', height: '50vh', minHeight: '400px' }}>
          <img
            src={getOptimizedImageUrl(post.image, { width: 1200, crop: 'fill' })}
            alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2))' }}></div>
          <div style={{ position: 'absolute', bottom: '2rem', left: '0', right: '0', padding: '0 1.5rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', color: 'white' }}>
              <Link href="/blog" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>
                ← Back to Blog
              </Link>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {post.tags.map(tag => (
                  <span key={tag} style={{ background: 'var(--hill-blue)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="heading-xl" style={{ color: 'white', marginBottom: '1rem', lineHeight: 1.2 }}>{post.title}</h1>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>
                <span>By {post.author}</span>
                <span>{post.date}</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <article style={{ maxWidth: '800px', margin: '4rem auto 0', padding: '0 1.5rem', fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--hill-navy)' }}>
          <div 
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        <style jsx global>{\`
          .blog-content h2, .blog-content h3 {
            font-family: var(--font-display);
            color: var(--hill-navy-deep);
            margin-top: 2.5rem;
            margin-bottom: 1rem;
          }
          .blog-content h3 {
            font-size: 1.5rem;
          }
          .blog-content p {
            margin-bottom: 1.5rem;
            color: var(--hill-muted);
          }
          .blog-content ul {
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
            color: var(--hill-muted);
          }
          .blog-content li {
            margin-bottom: 0.5rem;
          }
          .blog-content strong {
            color: var(--hill-navy);
          }
          .blog-content a {
            color: var(--hill-blue-bright);
            text-decoration: underline;
          }
        \`}</style>
      </main>
      <Footer id="footer" settings={settings} />
    </>
  )
}
