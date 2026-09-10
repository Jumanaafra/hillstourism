import type { Metadata } from 'next'
import { getSeoByRoute } from '../repositories/seo.repo'
import { getCanonicalUrl } from './siteUrl'

/**
 * Resolves Next.js Metadata by checking for Admin-configured SEO in Firestore/memory,
 * and falling back gracefully to the provided default metadata.
 */
export async function resolvePageMetadata(
  route: string,
  defaultMeta: Metadata
): Promise<Metadata> {
  try {
    const customSeo = await getSeoByRoute(route)
    if (!customSeo) return defaultMeta

    const canonical: string = customSeo.canonicalUrl
      ? (customSeo.canonicalUrl.startsWith('http') ? customSeo.canonicalUrl : getCanonicalUrl(customSeo.canonicalUrl))
      : typeof defaultMeta.alternates?.canonical === 'string'
      ? defaultMeta.alternates.canonical
      : getCanonicalUrl(route)

    const robotsSetting = customSeo.robots
      ? {
          index: !customSeo.robots.includes('noindex'),
          follow: !customSeo.robots.includes('nofollow'),
        }
      : defaultMeta.robots

    return {
      ...defaultMeta,
      title: customSeo.title || defaultMeta.title,
      description: customSeo.description || defaultMeta.description,
      alternates: {
        canonical,
      },
      openGraph: {
        ...defaultMeta.openGraph,
        title: customSeo.ogTitle || customSeo.title || (typeof defaultMeta.openGraph?.title === 'string' ? defaultMeta.openGraph.title : undefined),
        description:
          customSeo.ogDescription ||
          customSeo.description ||
          (typeof defaultMeta.openGraph?.description === 'string' ? defaultMeta.openGraph.description : undefined),
        url: canonical,
        ...(customSeo.ogImage
          ? {
              images: [
                {
                  url: customSeo.ogImage,
                  width: 1200,
                  height: 630,
                  alt: customSeo.title || 'Hills Tourism',
                },
              ],
            }
          : {}),
      },
      robots: robotsSetting,
    }
  } catch (err) {
    console.warn(`[MetadataHelper] Failed to resolve custom SEO for ${route}:`, err)
    return defaultMeta
  }
}
