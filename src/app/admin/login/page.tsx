'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiKey } from 'react-icons/fi'
import ThemeToggle from '@/components/admin/ThemeToggle'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [useTokenMode, setUseTokenMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = useTokenMode
        ? { token: token.trim() }
        : { email: email.trim(), password: password.trim() }

      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (data.success) {
        router.push('/admin/dashboard')
      } else {
        setError(data.error?.message || data.error || 'Invalid admin credentials.')
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '12px 14px 12px 42px',
    borderRadius: '10px',
    border: '1px solid var(--admin-input-border, rgba(255,255,255,0.18))',
    background: 'var(--admin-input-bg, rgba(0,0,0,0.3))',
    color: 'var(--admin-input-text, #fff)',
    width: '100%',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--admin-bg, #060d24)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.25rem',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <ThemeToggle variant="mobile-quick" />
      </div>

      <div style={{
        width: '100%',
        maxWidth: '430px',
        background: 'var(--admin-card, rgba(255,255,255,0.04))',
        borderRadius: '20px',
        border: '1px solid var(--admin-card-border, rgba(255,255,255,0.09))',
        padding: '2.5rem 2rem',
        boxShadow: 'var(--admin-shadow-md, 0 16px 40px rgba(0,0,0,0.3))',
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'rgba(8, 120, 255, 0.12)',
            border: '1px solid rgba(8, 120, 255, 0.28)',
            marginBottom: '1rem',
          }}>
            <FiShield size={26} color="var(--admin-brand, #0878FF)" />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.55rem',
            fontWeight: 700,
            color: 'var(--admin-text, #fff)',
            marginBottom: '0.35rem',
            letterSpacing: '-0.02em',
          }}>
            Hills Tourism
          </h1>
          <p style={{ color: 'var(--admin-text-muted, rgba(255,255,255,0.6))', fontSize: '0.85rem' }}>
            Admin Operations Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {!useTokenMode ? (
            <>
              {/* Email / Username Field */}
              <div>
                <label
                  htmlFor="adminEmail"
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--admin-text-secondary, rgba(255,255,255,0.7))',
                    display: 'block',
                    marginBottom: '7px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 600,
                  }}
                >
                  Admin Email
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <FiMail
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      color: 'var(--admin-text-muted, rgba(255,255,255,0.45))',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    id="adminEmail"
                    type="text"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={inputStyle}
                    placeholder="admin@hillstourism.com"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="adminPassword"
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--admin-text-secondary, rgba(255,255,255,0.7))',
                    display: 'block',
                    marginBottom: '7px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 600,
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <FiLock
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      color: 'var(--admin-text-muted, rgba(255,255,255,0.45))',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    id="adminPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ ...inputStyle, paddingRight: '42px' }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--admin-text-muted, rgba(255,255,255,0.5))',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                    }}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Direct Token Mode */
            <div>
              <label
                htmlFor="adminToken"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--admin-text-secondary, rgba(255,255,255,0.7))',
                  display: 'block',
                  marginBottom: '7px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 600,
                }}
              >
                Admin Access Token
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FiKey
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    color: 'var(--admin-text-muted, rgba(255,255,255,0.45))',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="adminToken"
                  type="password"
                  required
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  style={inputStyle}
                  placeholder="Enter secret admin token"
                  autoFocus
                />
              </div>
            </div>
          )}

          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(239,68,68,0.14)',
              border: '1px solid rgba(239,68,68,0.35)',
              color: '#FCA5A5',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              padding: '13px 24px',
              fontSize: '0.92rem',
              fontWeight: 600,
              borderRadius: '10px',
              opacity: loading ? 0.65 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.35rem',
            }}
          >
            {loading ? 'Verifying...' : 'Sign In to Dashboard'}
          </button>
        </form>

        {/* Mode switcher link */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <button
            type="button"
            onClick={() => {
              setUseTokenMode(!useTokenMode)
              setError('')
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--admin-text-muted, rgba(255,255,255,0.5))',
              fontSize: '0.78rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '4px',
            }}
          >
            {useTokenMode ? '← Sign in with Email & Password' : 'Sign in with Secret Token instead'}
          </button>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--admin-border, rgba(255,255,255,0.08))' }}>
          <a
            href="/"
            style={{
              color: 'var(--admin-brand, #0878FF)',
              fontSize: '0.82rem',
              fontWeight: 500,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FiArrowLeft /> Back to Website
          </a>
        </div>
      </div>
    </div>
  )
}

