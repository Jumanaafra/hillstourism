import React, { useEffect, useRef, useState, useCallback } from 'react'
import { loadImage, getFramePath } from '../utils/imageLoader'

const PRIORITY_FRAMES = 25   // preload this many during loading screen
const MAX_WAIT_MS     = 10000 // absolute max loading-screen time

export default function LoadingScreen({ onComplete }) {
  const [progress,     setProgress]     = useState(0)
  const [logoVisible,  setLogoVisible]  = useState(false)
  const [tagVisible,   setTagVisible]   = useState(false)
  const [barVisible,   setBarVisible]   = useState(false)
  const [exiting,      setExiting]      = useState(false)
  const timeoutRef   = useRef(null)
  const startedRef   = useRef(false)

  const exit = useCallback(() => {
    setExiting(true)
    setTimeout(onComplete, 900)
  }, [onComplete])

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    /* Staggered reveal */
    setTimeout(() => setLogoVisible(true), 200)
    setTimeout(() => setTagVisible(true),  900)
    setTimeout(() => setBarVisible(true),  1100)

    /* Hard-cap: never stuck longer than MAX_WAIT_MS */
    timeoutRef.current = setTimeout(() => {
      setProgress(100)
      exit()
    }, MAX_WAIT_MS)

    /* Preload priority frames while showing loading screen */
    let loaded = 0
    const total = PRIORITY_FRAMES

    const tasks = Array.from({ length: total }, (_, i) =>
      loadImage(getFramePath(i), 6000).then(() => {
        loaded++
        setProgress(Math.round((loaded / total) * 90))  // cap at 90 while loading
      })
    )

    /* Minimum screen time: 2.6 s */
    const minWait = new Promise(r => setTimeout(r, 2600))

    Promise.all([Promise.all(tasks), minWait]).then(() => {
      clearTimeout(timeoutRef.current)
      setProgress(100)
      setTimeout(exit, 300)
    })

    return () => clearTimeout(timeoutRef.current)
  }, [exit])

  return (
    <div
      aria-label="Loading HillsTourism"
      aria-live="polite"
      style={{
        position:   'fixed',
        inset:      0,
        zIndex:     9999,
        background: '#040d04',
        display:    'flex',
        flexDirection: 'column',
        alignItems:  'center',
        justifyContent: 'center',
        gap: '0',
        opacity:    exiting ? 0 : 1,
        transform:  exiting ? 'scale(1.04)' : 'scale(1)',
        transition: 'opacity 0.9s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94)',
        pointerEvents: exiting ? 'none' : 'all',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '600px', height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        opacity: logoVisible ? 1 : 0,
        transition: 'opacity 2s ease',
      }} />

      {/* Logo */}
      <div
        style={{
          opacity:   logoVisible ? 1 : 0,
          transform: logoVisible ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(24px)',
          filter:    logoVisible ? 'blur(0px)' : 'blur(14px)',
          transition: [
            'opacity 1.4s cubic-bezier(0.16,1,0.3,1) 0.1s',
            'transform 1.4s cubic-bezier(0.16,1,0.3,1) 0.1s',
            'filter 1.4s ease 0.1s',
          ].join(','),
          marginBottom: '2.5rem',
        }}
      >
        <img
          src="/logo.png"
          alt="HillsTourism"
          style={{
            height:     'clamp(60px, 10vw, 96px)',
            width:      'auto',
            maxWidth:   '320px',
            objectFit:  'contain',
            filter:     'brightness(1.08) drop-shadow(0 0 20px rgba(201,168,76,0.2))',
          }}
          onError={(e) => {
            /* Fallback text logo if image fails */
            e.target.style.display = 'none'
            const fb = document.createElement('div')
            fb.innerHTML = `
              <div style="text-align:center">
                <div style="font-family:'Playfair Display',serif;font-size:clamp(1.8rem,5vw,3rem);color:#c9a84c;letter-spacing:0.05em;font-weight:500;">HILLS</div>
                <div style="font-family:'Playfair Display',serif;font-size:clamp(1.8rem,5vw,3rem);color:#f5f0e8;letter-spacing:0.08em;font-weight:400;">TOURISM</div>
              </div>`
            e.target.parentNode.appendChild(fb)
          }}
        />
      </div>

      {/* Tagline */}
      <p style={{
        fontFamily:   'Inter, sans-serif',
        fontSize:     '0.65rem',
        fontWeight:   600,
        letterSpacing: '0.32em',
        textTransform: 'uppercase',
        color:        'rgba(201,168,76,0.65)',
        marginBottom: '2.75rem',
        opacity:      tagVisible ? 1 : 0,
        transform:    tagVisible ? 'translateY(0)' : 'translateY(10px)',
        transition:   'opacity 1s ease, transform 1s cubic-bezier(0.16,1,0.3,1)',
      }}>
        EXPLORE · EXPERIENCE · REMEMBER
      </p>

      {/* Progress */}
      <div style={{
        width:    'clamp(140px, 20vw, 200px)',
        opacity:  barVisible ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}>
        <div style={{
          height:          '1px',
          background:      'rgba(255,255,255,0.08)',
          borderRadius:    '1px',
          overflow:        'hidden',
          marginBottom:    '10px',
        }}>
          <div style={{
            height:     '100%',
            width:      `${progress}%`,
            background: 'linear-gradient(90deg, #c9a84c, #e8c96e)',
            borderRadius: '1px',
            transition: 'width 0.4s var(--ease-premium)',
            boxShadow:  '0 0 8px rgba(201,168,76,0.5)',
          }} />
        </div>
        <p style={{
          textAlign:     'center',
          fontSize:      '0.62rem',
          color:         'rgba(255,255,255,0.2)',
          fontFamily:    'Inter, sans-serif',
          letterSpacing: '0.2em',
        }}>
          {progress}%
        </p>
      </div>
    </div>
  )
}
