'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { trackChatOpen, trackChatMessage } from '../lib/analytics/events'

const QUICK_ACTIONS = ['Couple', 'Family', 'Friends', 'Adventure']

// Simple markdown-like renderer
function MessageText({ text }) {
  const lines = text.split('\n')
  return (
    <div>
      {lines.map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return (
          <p key={i} style={{ margin: i > 0 ? '4px 0 0' : '0' }}>
            {parts.map((part, j) =>
              j % 2 === 1
                ? <strong key={j}>{part}</strong>
                : part
            )}
          </p>
        )
      })}
    </div>
  )
}

export default function HillGuide() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      text: "Hi 👋 I am HillGuide, your mountain companion!\nWhat kind of hill escape are you planning?",
      chips: QUICK_ACTIONS,
    }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const messagesRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setMounted(true)
      trackChatOpen()
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      const t = setTimeout(() => setMounted(false), 400)
      return () => clearTimeout(t)
    }
  }, [open])

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages, typing])

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const userMsg = { id: Date.now(), from: 'user', text: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)
    trackChatMessage(trimmed.length)

    // Build history for grounding context
    const chatHistory = messages.map(m => ({
      role: m.from === 'user' ? 'user' : 'model',
      text: m.text,
    }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: chatHistory,
        }),
      })

      const data = await res.json()
      setTyping(false)

      if (res.ok && data.success && data.data?.reply) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          from: 'bot',
          text: data.data.reply,
          chips: data.data.chips || [],
        }])
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          from: 'bot',
          text: "I'm having trouble retrieving details right now. Please explore our curated packages above or reach out via WhatsApp at +91 99990 00000!",
          chips: ['View packages', 'WhatsApp us'],
        }])
      }
    } catch (err) {
      console.error('[HillGuide] Chat network error:', err)
      setTyping(false)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        from: 'bot',
        text: "You can reach our trip planning desk anytime on WhatsApp at +91 99990 00000 or fill out the enquiry form!",
        chips: ['Fill enquiry form', 'WhatsApp us'],
      }])
    }
  }, [messages])

  const handleSubmit = (e) => {
    e?.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      {/* ── Floating Launcher ── */}
      <div className="chatbot-launcher" role="complementary" aria-label="HillGuide chat assistant">
        {/* Pulse ring when closed */}
        {!open && (
          <div style={{
            position:     'absolute',
            bottom:       0,
            right:        0,
            width:        '56px',
            height:       '56px',
            borderRadius: '50%',
            background:   'var(--hill-blue-bright)',
            animation:    'pulseRing 2.5s ease-in-out infinite',
            pointerEvents: 'none',
          }} aria-hidden="true" />
        )}

        <button
          className="chatbot-fab"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close HillGuide' : 'Open HillGuide — AI travel assistant'}
          aria-expanded={open}
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          )}
        </button>
      </div>

      {/* ── Chat window ── */}
      {mounted && (
        <div
          className="chatbot-window"
          role="dialog"
          aria-modal="true"
          aria-label="HillGuide — Hillstourism AI Travel Assistant"
          style={{
            opacity:   open ? 1 : 0,
            transform: open
              ? 'scale(1) translateY(0)'
              : 'scale(0.92) translateY(20px)',
            transition: 'opacity 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Header */}
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Avatar */}
              <div style={{
                width:        '36px',
                height:       '36px',
                borderRadius: '50%',
                background:   'var(--hill-blue-bright)',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                fontSize:     '1.1rem',
                flexShrink:   0,
              }} aria-hidden="true">
                🏔️
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#ffffff', fontSize: '0.9rem', lineHeight: 1 }}>
                  HillGuide
                </p>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                  <span style={{
                    display:      'inline-block',
                    width:        '6px',
                    height:       '6px',
                    borderRadius: '50%',
                    background:   '#22C55E',
                    marginRight:  '4px',
                    verticalAlign: 'middle',
                  }} />
                  Grounded AI travel expert
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border:     'none',
                color:      'rgba(255,255,255,0.7)',
                width:      '28px',
                height:     '28px',
                borderRadius: '50%',
                cursor:     'pointer',
                fontSize:   '1rem',
                display:    'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages" ref={messagesRef} aria-live="polite">
            {messages.map(msg => (
              <div key={msg.id}>
                <div className={msg.from === 'bot' ? 'chat-bubble-bot' : 'chat-bubble-user'}>
                  <MessageText text={msg.text} />
                </div>
                {msg.chips && msg.chips.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem', paddingLeft: msg.from === 'bot' ? '0' : 'auto' }}>
                    {msg.chips.map(chip => (
                      <button
                        key={chip}
                        className="chat-chip"
                        onClick={() => sendMessage(chip)}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="chat-bubble-bot" style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '0.75rem 1rem', width: 'fit-content' }}>
                {[0,1,2].map(i => (
                  <span key={i} style={{
                    width:        '7px',
                    height:       '7px',
                    borderRadius: '50%',
                    background:   'var(--hill-blue-bright)',
                    display:      'inline-block',
                    animation:    `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            )}
          </div>

          {/* Input row */}
          <form className="chatbot-input-row" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything about packages, stays, vehicles…"
              aria-label="Type your question"
              style={{
                flex:         1,
                padding:      '0.65rem 0.85rem',
                borderRadius: '8px',
                border:       '1.5px solid var(--hill-border)',
                fontFamily:   'var(--font-body)',
                fontSize:     '0.85rem',
                outline:      'none',
                color:        'var(--hill-text)',
                background:   'var(--hill-surface)',
                transition:   'border-color 0.2s ease',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--hill-blue-bright)'}
              onBlur={e  => e.target.style.borderColor = 'var(--hill-border)'}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '0.65rem 1rem', fontSize: '0.75rem', flexShrink: 0 }}
              aria-label="Send message"
              disabled={!input.trim()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes pulseRing {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50%       { transform: scale(1.25); opacity: 0; }
        }
        @keyframes typingDot {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50%       { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  )
}
