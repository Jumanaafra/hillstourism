import { useEffect, useRef, useCallback } from 'react'
import { loadImage, getFramePath } from '../utils/imageLoader'

export const TOTAL_FRAMES = 291 // frame_000 … frame_290

/**
 * useFrameSequence
 *
 * Manages loading and rendering of the 291-frame hero animation on a 100vh <canvas>.
 * Plays smooth cinematic frame animation loop while preserving 16:9 aspect ratio and DPR.
 *
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef
 * @param {React.RefObject<HTMLElement>}       sectionRef  – outer scroll section
 * @param {boolean} enabled – start loading and animations when true
 */
export function useFrameSequence(canvasRef, sectionRef, enabled) {
  const imagesRef          = useRef(new Array(TOTAL_FRAMES).fill(null))
  const loadedRef          = useRef(new Array(TOTAL_FRAMES).fill(false))
  const cssDimsRef         = useRef({ w: 0, h: 0 })
  const curFrameRef        = useRef(0)
  const lastRenderedImgRef = useRef(null)

  /* ─── Render ─────────────────────────────────── */
  const renderFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { w, h } = cssDimsRef.current
    if (!w || !h) return

    /* Find exact frame or nearest loaded frame */
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

    /* Cover-mode draw (16:9 source) */
    const IMG_AR  = 800 / 450
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

  /* ─── Canvas resize ──────────────────────────── */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w   = window.innerWidth
    const h   = window.innerHeight

    canvas.width  = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    canvas.style.width  = `${w}px`
    canvas.style.height = `${h}px`

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
    }

    cssDimsRef.current = { w, h }
    renderFrame(curFrameRef.current)
  }, [canvasRef, renderFrame])

  /* ─── Load frames ────────────────────────────── */
  useEffect(() => {
    if (!enabled) return

    let isMounted = true

    const loadSingle = async (i) => {
      if (loadedRef.current[i]) return imagesRef.current[i]
      const img = await loadImage(getFramePath(i), 10000)
      if (img && isMounted) {
        imagesRef.current[i] = img
        loadedRef.current[i] = true
        if (i === curFrameRef.current) {
          renderFrame(i)
        }
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

      // 2. Load early priority frames
      const priorityTasks = []
      for (let i = 1; i < Math.min(30, TOTAL_FRAMES); i++) {
        priorityTasks.push(loadSingle(i))
      }
      await Promise.all(priorityTasks)

      // 3. Load all remaining frames in batches
      const BATCH_SIZE = 25
      for (let i = 30; i < TOTAL_FRAMES; i += BATCH_SIZE) {
        if (!isMounted) break
        const batch = []
        for (let j = i; j < Math.min(i + BATCH_SIZE, TOTAL_FRAMES); j++) {
          batch.push(loadSingle(j))
        }
        await Promise.all(batch)
        await new Promise((r) => setTimeout(r, 15))
      }
    }

    loadAll()

    return () => {
      isMounted = false
    }
  }, [enabled, resizeCanvas, renderFrame])

  /* ─── Animation Loop (Smooth 25 FPS) ─────────── */
  useEffect(() => {
    if (!enabled) return

    resizeCanvas()

    const handleResize = () => {
      resizeCanvas()
    }
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
