import React, { useState, useRef, useEffect, useCallback } from 'react'

// ─────────────────────────────────────────────────────────────
// Deterministic response engine (AI-replaceable)
// Structure: intent patterns → response
// Replace the `getResponse` function with your AI call later.
// ─────────────────────────────────────────────────────────────

const QUICK_ACTIONS = ['Couple', 'Family', 'Friends', 'Adventure']

const RESPONSES = {
  couple: {
    message: "💑 Perfect! For couples we recommend:\n\n🏔️ **Munnar Honeymoon Escape** (3N/4D)\n🌿 **Coorg Romance Trails** (4N/5D)\n🌄 **Darjeeling Sunrise Special** (3N/4D)\n\nAll include curated stays, private transfers, and sunset experiences. Want me to share pricing?",
    chips: ['Yes, show pricing', 'Tell me about Munnar', 'What stays are included?'],
  },
  family: {
    message: "👨‍👩‍👧‍👦 Great choice for the family! Here are our top family packages:\n\n🌲 **Coorg Family Trails** (4N/5D)\n🏕️ **Ooty Highlands Family Escape** (3N/4D)\n🦁 **Anamalai Wildlife Family Package** (5N/6D)\n\nAll our family packages include child-friendly activities and flexible itineraries.",
    chips: ['Show pricing', 'Tell me about Coorg', 'What age groups?'],
  },
  friends: {
    message: "🎉 Friends trips are our specialty! Check these out:\n\n⛺ **Manali Adventure Pack** (5N/6D)\n🏔️ **Shimla Corporate/Friends Retreat** (3N/4D)\n🌊 **Coorg Waterfall Trek** (3N/4D)\n\nAll packages include group accommodation, campfires, and local experiences.",
    chips: ['What activities included?', 'Show group pricing', 'Trekking options'],
  },
  adventure: {
    message: "🧗 Ready for an adventure? Here's what we offer:\n\n⛰️ **Mountain Trekking** — guided ridge trails\n🚙 **Jeep Safari** — forest wildlife drives\n💧 **Waterfall Trails** — 4–5 hour forest treks\n🌅 **Sunrise Viewpoints** — pre-dawn experiences\n\nAll led by local expert guides.",
    chips: ['Book a trek', 'Tell me about safari', 'Difficulty levels'],
  },
  pricing: {
    message: "💰 Our package prices start from:\n\n• Couple packages — ₹8,999/person\n• Family packages — ₹7,499/person\n• Group packages — ₹5,999/person\n• Solo/custom — contact us\n\nAll prices include accommodation, transport, and guided experiences. Seasonal offers available.",
    chips: ['What\'s included?', 'Book now', 'Custom package'],
  },
  stays: {
    message: "🏡 We curate stays across categories:\n\n• **Normal** — Cosy homestays (from ₹2,800/night)\n• **Premium** — Boutique resorts (from ₹6,500/night)\n• **5 Star** — Luxury retreats (from ₹14,500/night)\n\nYou can also use our Smart Stay Matcher on the page to find your perfect match!",
    chips: ['Match my stay', 'Tell me about 5 star', 'Family stays'],
  },
  vehicles: {
    message: "🚗 All our trips include comfortable vehicles with local drivers:\n\n• Sedan — up to 4 people\n• Innova Crysta — up to 7 people\n• Tempo Traveller — up to 12 people\n• Fortuner — premium 4×4 for mountain roads\n\nAll vehicles include hill-experienced drivers and 24/7 support.",
    chips: ['Pricing', 'Book vehicle', 'Airport pickup?'],
  },
  time: {
    message: "📅 Best times to visit:\n\n🌸 **Oct–Feb** — Cool, clear skies. Best for Munnar, Ooty, Coorg\n❄️ **Nov–Mar** — Snow season. Best for Manali, Shimla, Darjeeling\n🌧️ **Jun–Sep** — Monsoon magic in Kerala & Coorg (lush, fewer crowds)\n\nEach destination has its own sweet spot. Which area are you thinking?",
    chips: ['Munnar timing', 'Manali timing', 'Coorg timing'],
  },
  duration: {
    message: "⏱️ Our packages run from:\n\n• Weekend escape — 2N/3D\n• Short break — 3N/4D ⭐ Most popular\n• Full experience — 5N/6D\n• Extended journey — 7N/8D\n\nWe recommend at least 4 nights to truly experience any hill destination.",
    chips: ['3N/4D options', '5N/6D options', 'Weekend escapes'],
  },
  contact: {
    message: "📞 Here's how to reach us:\n\n📱 **WhatsApp** — wa.me/919999000000 (fastest)\n📧 **Email** — hello@hillstourism.com\n📞 **Phone** — +91 99990 00000\n⏰ Available 9am–9pm, 7 days\n\nOr scroll up and fill out our enquiry form for a detailed trip plan!",
    chips: ['Fill enquiry form', 'WhatsApp now', 'Email us'],
  },
  itinerary: {
    message: "🗺️ Every Hillstourism journey comes with a day-by-day itinerary that includes:\n\n• All accommodation bookings\n• Transport & transfers\n• Guided experiences\n• Meal inclusions\n• Emergency contacts\n• Local tips\n\nWould you like a sample itinerary for a specific destination?",
    chips: ['Munnar sample', 'Manali sample', 'Coorg sample'],
  },
  default: {
    message: "I'm HillGuide 🏔️, your mountain travel companion!\n\nI can help you with:\n• Finding the right package\n• Choosing a stay\n• Best times to visit\n• Experiences & activities\n• Pricing & booking\n\nWhat would you like to know?",
    chips: ['Find a package', 'Stays info', 'Best time to visit'],
  },
}

function getResponse(text) {
  const t = text.toLowerCase()
  if (t.match(/couple|honeymoon|romance|partner/))    return RESPONSES.couple
  if (t.match(/family|kid|child|parent/))             return RESPONSES.family
  if (t.match(/friend|group|gang|squad/))             return RESPONSES.friends
  if (t.match(/adventure|trek|hike|wild|safari/))     return RESPONSES.adventure
  if (t.match(/price|cost|budget|expensive|cheap|₹/)) return RESPONSES.pricing
  if (t.match(/stay|hotel|resort|homestay|accomm/))   return RESPONSES.stays
  if (t.match(/vehicle|car|cab|transport|drive/))     return RESPONSES.vehicles
  if (t.match(/time|when|season|month|best time/))    return RESPONSES.time
  if (t.match(/duration|how long|days|nights/))       return RESPONSES.duration
  if (t.match(/contact|call|whatsapp|phone|email/))   return RESPONSES.contact
  if (t.match(/itinerary|plan|schedule|route/))       return RESPONSES.itinerary
  return RESPONSES.default
}

// Simple markdown-like renderer
function MessageText({ text }) {
  const lines = text.split('\n')
  return (
    <div>
      {lines.map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return (
          <p key={i} style={{ margin: i > 0 ? '2px 0 0' : '0' }}>
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
  const [open,    setOpen]    = useState(false)
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState([
    {
      id:   1,
      from: 'bot',
      text: "Hi 👋\nWhat kind of hill escape are you planning?",
      chips: QUICK_ACTIONS,
    }
  ])
  const [input,    setInput]    = useState('')
  const [typing,   setTyping]   = useState(false)
  const messagesRef = useRef(null)
  const inputRef    = useRef(null)

  useEffect(() => {
    if (open) {
      setMounted(true)
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

  const addBotResponse = useCallback((text, chips = []) => {
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, {
        id:   Date.now(),
        from: 'bot',
        text,
        chips,
      }])
    }, 900 + Math.random() * 400)
  }, [])

  const sendMessage = useCallback((text) => {
    const trimmed = text.trim()
    if (!trimmed) return

    setMessages(prev => [...prev, { id: Date.now(), from: 'user', text: trimmed }])
    setInput('')

    const response = getResponse(trimmed)
    addBotResponse(response.message, response.chips)
  }, [addBotResponse])

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
                  Your mountain travel expert
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
              placeholder="Ask me anything about your trip…"
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
