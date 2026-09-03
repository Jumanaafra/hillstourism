import { useEffect, useRef } from 'react'

/**
 * useScrollReveal
 *
 * Adds `.visible` to elements matching `selector` inside `containerRef`
 * when they enter the viewport, enabling CSS-driven scroll reveals.
 *
 * Falls back gracefully if IntersectionObserver is unavailable.
 */
export function useScrollReveal(containerRef, selector = '.reveal') {
  useEffect(() => {
    const container = containerRef?.current
    if (!container) return

    if (!('IntersectionObserver' in window)) {
      /* Fallback: make everything visible immediately */
      container.querySelectorAll(selector).forEach(el => el.classList.add('visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)   // fire once
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    container.querySelectorAll(selector).forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [containerRef, selector])
}
