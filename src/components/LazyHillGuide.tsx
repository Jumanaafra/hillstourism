'use client'

import dynamic from 'next/dynamic'

const HillGuide = dynamic(() => import('./HillGuide'), { ssr: false })

export default function LazyHillGuide() {
  return <HillGuide />
}
