'use client'

import { useEffect } from 'react'

export default function LoadingScreen({ onComplete }) {
  useEffect(() => {
    // Non-blocking callback to resolve any waiting consumers immediately
    onComplete?.()
  }, [onComplete])

  return null
}
