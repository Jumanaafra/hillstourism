import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { loadImage, getFramePath } from '../utils/imageLoader'

gsap.registerPlugin(ScrollTrigger)

export const TOTAL_FRAMES = 291 // frame_000 … frame_290

/**
 * useScrollFrameSequence
 * Scroll-controlled 290-frame cinematic hero with GSAP pinning.
 *
 * Architecture:
 * - containerRef: The outer scroll track (height: 100vh + scrollDistance)
 * - pinRef: The inner viewport element (height: 100vh) pinned by GSAP
 * - As the user scrolls through the container track, progress maps from [0, 1]
 *   which translates exactly to frames [0, 290].
 * - Frame 290 is reached at progress = 1.0. ONLY then does ScrollTrigger unpin,
 *   allowing the Journey section to immediately enter the viewport.
 */
export function useScrollFrameSequence(canvasRef, containerRef, pinRef, onProgress, enabled = true) {
  const imagesRef          = useRef(new Array(TOTAL_FRAMES).fill(null))
  const loadedRef          = useRef(new Array(TOTAL_FRAMES).fill(false))
  const cssDimsRef         = useRef({ w: 0, h: 0 })
  const curFrameRef        = useRef(0)
  const lastRenderedImgRef = useRef(null)
  const stRef              = useRef(null)
  const onProgressRef      = useRef(onProgress)

  // Keep callback ref updated without triggering effect re-runs
  useEffect(() => {
    onProgressRef.current = onProgress
  }, [onProgress])

  /* ── Render a frame to canvas ────────────────────── */
  const renderFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { w, h } = cssDimsRef.current
    if (!w || !h) return

    // Find exact frame or nearest loaded neighbor
    let img = imagesRef.current[frameIndex]
    if (!img || !loadedRef.current[frameIndex]) {
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const lo = frameIndex - offset
        const hi = frameIndex + offset
        if (lo >= 0 && loadedRef.current[lo] && imagesRef.current[lo]) {
          img = imagesRef.current[lo]
          break
        }
        if (hi < TOTAL_FRAMES && loadedRef.current[hi] && imagesRef.current[hi]) {
          img = imagesRef.current[hi]
          break
        }
      }
    }

    if (!img) img = lastRenderedImgRef.current
    if (!img) return
    lastRenderedImgRef.current = img

    // Cover-mode draw maintaining natural source aspect ratio
    const imgW = img.naturalWidth || 800
    const imgH = img.naturalHeight || 450
    const IMG_AR = imgW / imgH
    const CNVS_AR = w / h

    let dw, dh, dx, dy
    if (CNVS_AR > IMG_AR) {
      dw = w
      dh = w / IMG_AR
      dx = 0
      dy = (h - dh) / 2
    } else {
      dh = h
      dw = h * IMG_AR
      dx = (w - dw) / 2
      dy = 0
    }

    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(img, dx, dy, dw, dh)
    curFrameRef.current = frameIndex
  }, [canvasRef])

  /* ── Resize canvas to match viewport ─────────────── */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(dpr, dpr)
    cssDimsRef.current = { w, h }
    renderFrame(curFrameRef.current)
  }, [canvasRef, renderFrame])

  /* ── Progressive frame loading ───────────────────── */
  useEffect(() => {
    if (!enabled) return
    let isMounted = true

    const loadSingle = async (i) => {
      if (loadedRef.current[i]) return imagesRef.current[i]
      const img = await loadImage(getFramePath(i), 12000)
      if (img && isMounted) {
        imagesRef.current[i] = img
        loadedRef.current[i] = true
        // Re-render if this matches current frame
        if (i === curFrameRef.current) renderFrame(i)
      }
      return img
    }

    const loadAll = async () => {
      // 1. Immediately load frame 0 and display
      await loadSingle(0)
      if (isMounted) {
        resizeCanvas()
        renderFrame(0)
      }

      // 2. High priority: first 40 frames for instant scroll readiness
      const priority = []
      for (let i = 1; i < Math.min(40, TOTAL_FRAMES); i++) {
        priority.push(loadSingle(i))
      }
      await Promise.all(priority)

      // 3. Load remaining frames in batches
      const BATCH = 30
      for (let i = 40; i < TOTAL_FRAMES; i += BATCH) {
        if (!isMounted) break
        const batch = []
        for (let j = i; j < Math.min(i + BATCH, TOTAL_FRAMES); j++) {
          batch.push(loadSingle(j))
        }
        await Promise.all(batch)
        await new Promise((r) => setTimeout(r, 10))
      }
    }

    loadAll()
    return () => {
      isMounted = false
    }
  }, [enabled, resizeCanvas, renderFrame])

  /* ── GSAP ScrollTrigger Pin & Scrub Setup ────────── */
  useEffect(() => {
    if (!enabled || !containerRef.current || !pinRef.current) return

    resizeCanvas()

    const handleResize = () => {
      resizeCanvas()
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', handleResize, { passive: true })

    const ctx = gsap.context(() => {
      stRef.current = ScrollTrigger.create({
        trigger: containerRef.current,
        pin: pinRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pinSpacing: false,
        scrub: 0.05, // Ultra-responsive scrub
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = Math.max(0, Math.min(1, self.progress))
          const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES))
          renderFrame(frameIndex)
          onProgressRef.current?.(frameIndex, progress)
        },
      })
    })

    // Refresh after DOM layout settles
    const timer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 100)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
      ctx.revert()
      stRef.current?.kill()
    }
  }, [enabled, containerRef, pinRef, resizeCanvas, renderFrame])
}

/**
 * useFrameSequence (legacy auto-play — used by LoadingScreen)
 */
export function useFrameSequence(canvasRef, sectionRef, enabled) {
  const imagesRef          = useRef(new Array(TOTAL_FRAMES).fill(null))
  const loadedRef          = useRef(new Array(TOTAL_FRAMES).fill(false))
  const cssDimsRef         = useRef({ w: 0, h: 0 })
  const curFrameRef        = useRef(0)
  const lastRenderedImgRef = useRef(null)

  const renderFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { w, h } = cssDimsRef.current
    if (!w || !h) return
    let img = imagesRef.current[frameIndex]
    if (!img || !loadedRef.current[frameIndex]) {
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const lo = frameIndex - offset
        const hi = frameIndex + offset
        if (lo >= 0 && loadedRef.current[lo]) {
          img = imagesRef.current[lo]
          break
        }
        if (hi < TOTAL_FRAMES && loadedRef.current[hi]) {
          img = imagesRef.current[hi]
          break
        }
      }
    }
    if (!img) img = lastRenderedImgRef.current
    if (!img) return
    lastRenderedImgRef.current = img
    const imgW = img.naturalWidth || 800
    const imgH = img.naturalHeight || 450
    const IMG_AR = imgW / imgH
    const CNVS_AR = w / h
    let dw, dh, dx, dy
    if (CNVS_AR > IMG_AR) {
      dw = w
      dh = w / IMG_AR
      dx = 0
      dy = (h - dh) / 2
    } else {
      dh = h
      dw = h * IMG_AR
      dx = (w - dw) / 2
      dy = 0
    }
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(img, dx, dy, dw, dh)
  }, [canvasRef])

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(dpr, dpr)
    cssDimsRef.current = { w, h }
    renderFrame(curFrameRef.current)
  }, [canvasRef, renderFrame])

  useEffect(() => {
    if (!enabled) return
    let isMounted = true
    const loadSingle = async (i) => {
      if (loadedRef.current[i]) return
      const img = await loadImage(getFramePath(i), 10000)
      if (img && isMounted) {
        imagesRef.current[i] = img
        loadedRef.current[i] = true
      }
    }
    const loadAll = async () => {
      await loadSingle(0)
      if (isMounted) {
        resizeCanvas()
        renderFrame(0)
      }
      const priority = []
      for (let i = 1; i < Math.min(30, TOTAL_FRAMES); i++) priority.push(loadSingle(i))
      await Promise.all(priority)
      const BATCH = 25
      for (let i = 30; i < TOTAL_FRAMES; i += BATCH) {
        if (!isMounted) break
        const batch = []
        for (let j = i; j < Math.min(i + BATCH, TOTAL_FRAMES); j++) batch.push(loadSingle(j))
        await Promise.all(batch)
        await new Promise((r) => setTimeout(r, 15))
      }
    }
    loadAll()
    return () => {
      isMounted = false
    }
  }, [enabled, resizeCanvas, renderFrame])

  useEffect(() => {
    if (!enabled) return
    resizeCanvas()
    const handleResize = () => resizeCanvas()
    window.addEventListener('resize', handleResize, { passive: true })
    let animId
    let lastTime = performance.now()
    const FPS = 25
    const interval = 1000 / FPS
    const animateLoop = (now) => {
      const delta = now - lastTime
      if (delta >= interval) {
        lastTime = now - (delta % interval)
        curFrameRef.current = (curFrameRef.current + 1) % TOTAL_FRAMES
        renderFrame(curFrameRef.current)
      }
      animId = requestAnimationFrame(animateLoop)
    }
    animId = requestAnimationFrame(animateLoop)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animId) cancelAnimationFrame(animId)
    }
  }, [enabled, resizeCanvas, renderFrame])
}
