import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
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
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: 800,
          color: 'var(--hill-blue-bright, #0878FF)',
          marginBottom: '0.5rem',
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontFamily: 'var(--font-display, serif)',
          fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
          fontWeight: 600,
          marginBottom: '1rem',
        }}
      >
        Trail Not Found
      </h2>
      <p
        style={{
          maxWidth: '480px',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '0.95rem',
          lineHeight: 1.6,
          marginBottom: '2rem',
        }}
      >
        Looks like this mountain path doesn&apos;t exist. Let&apos;s get you back
        to the main trail — our curated hill journeys are waiting for you.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-block',
          padding: '12px 32px',
          background: 'var(--hill-blue-bright, #0878FF)',
          color: '#ffffff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: 600,
          transition: 'transform 0.2s',
        }}
      >
        Return to Hills Tourism
      </Link>
    </div>
  )
}
