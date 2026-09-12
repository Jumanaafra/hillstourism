'use client'

import React, { useState } from 'react'
import { FiCheck } from 'react-icons/fi'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  if (subscribed) {
    return (
      <p style={{ color: 'var(--hill-blue-bright)', fontSize: '0.85rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <FiCheck style={{ fontSize: '1rem', flexShrink: 0 }} /> You're on the list. Adventures ahead!
      </p>
    )
  }

  return (
    <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }} aria-label="Newsletter signup">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        aria-label="Email address for newsletter"
        style={{
          padding:      '0.75rem 1rem',
          background:   'rgba(255,255,255,0.06)',
          border:       '1px solid rgba(255,255,255,0.12)',
          borderRadius: '6px',
          color:        '#ffffff',
          fontSize:     '0.85rem',
          outline:      'none',
          minWidth:     '220px',
          fontFamily:   'var(--font-body)',
          transition:   'border-color 0.2s ease',
        }}
        onFocus={e  => e.target.style.borderColor = 'var(--hill-blue-bright)'}
        onBlur={e   => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
      />
      <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.4rem', fontSize: '0.75rem' }}>
        Subscribe
      </button>
    </form>
  )
}
