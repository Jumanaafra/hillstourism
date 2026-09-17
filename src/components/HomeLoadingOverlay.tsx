'use client'

import { useLayoutEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const LoadingScreen = dynamic(() => import('./LoadingScreen'), { ssr: false })

export default function HomeLoadingOverlay() {
  const [showLoader, setShowLoader] = useState(true)

  useLayoutEffect(() => {
    if (sessionStorage.getItem('ht_loaded') === '1') setShowLoader(false)
  }, [])

  const handleLoadComplete = () => {
    sessionStorage.setItem('ht_loaded', '1')
    setShowLoader(false)
  }

  return showLoader ? <LoadingScreen onComplete={handleLoadComplete} /> : null
}
