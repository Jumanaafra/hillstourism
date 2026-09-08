'use client'

import React from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--hill-navy-deep, #07152F)',
        color: '#ffffff',
        fontFamily: 'var(--font-body, system-ui)',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-display, serif)',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 700,
          color: 'var(--hill-blue-bright, #0878FF)',
          marginBottom: '1rem',
        }}
      >
        Something went wrong
      </h1>
      <p
        style={{
          maxWidth: '480px',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '0.95rem',
          lineHeight: 1.6,
          marginBottom: '2rem',
        }}
      >
        We encountered an unexpected issue while loading this mountain journey. Please try again.
      </p>
      <button
        onClick={() => reset()}
        style={{
          display: 'inline-block',
          padding: '12px 32px',
          background: 'var(--hill-blue-bright, #0878FF)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Try Again
      </button>
    </div>
  )
}
