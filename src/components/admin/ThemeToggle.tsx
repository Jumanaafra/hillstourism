'use client'

import React from 'react'
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi'
import { useAdminTheme, type ThemePreference } from '@/context/AdminThemeContext'

interface ThemeToggleProps {
  variant?: 'desktop-header' | 'mobile-quick' | 'mobile-drawer' | 'settings'
  className?: string
}

export default function ThemeToggle({ variant = 'desktop-header', className = '' }: ThemeToggleProps) {
  const { themePreference, resolvedTheme, setTheme, cycleTheme } = useAdminTheme()

  // 1. Mobile Quick Toggle (for MobileAdminHeader)
  if (variant === 'mobile-quick') {
    const currentIcon =
      themePreference === 'light' ? (
        <FiSun size={17} style={{ color: '#F59E0B' }} />
      ) : themePreference === 'dark' ? (
        <FiMoon size={17} style={{ color: '#38BDF8' }} />
      ) : (
        <FiMonitor size={17} style={{ color: resolvedTheme === 'dark' ? '#A78BFA' : '#6366F1' }} />
      )

    const label =
      themePreference === 'light'
        ? 'Light Theme'
        : themePreference === 'dark'
        ? 'Dark Theme'
        : `System Theme (${resolvedTheme})`

    return (
      <button
        type="button"
        onClick={cycleTheme}
        aria-label={`Current: ${label}. Tap to switch theme.`}
        title={`Current: ${label}. Tap to cycle theme.`}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          background: 'var(--admin-card, rgba(255, 255, 255, 0.06))',
          border: '1px solid var(--admin-card-border, rgba(255, 255, 255, 0.12))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
        className={className}
      >
        {currentIcon}
      </button>
    )
  }

  // 2. Mobile Drawer Selector (full row segmented pill)
  if (variant === 'mobile-drawer') {
    const options: Array<{ key: ThemePreference; label: string; icon: React.ReactNode }> = [
      { key: 'light', label: 'Light', icon: <FiSun size={15} /> },
      { key: 'dark', label: 'Dark', icon: <FiMoon size={15} /> },
      { key: 'system', label: 'Auto', icon: <FiMonitor size={15} /> },
    ]

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className={className}>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--admin-text-secondary, rgba(255, 255, 255, 0.6))',
          }}
        >
          Theme Appearance
        </span>
        <div
          role="group"
          aria-label="Theme selection"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '4px',
            background: 'var(--admin-input-bg, rgba(0, 0, 0, 0.25))',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid var(--admin-border, rgba(255, 255, 255, 0.08))',
          }}
        >
          {options.map((opt) => {
            const isSelected = themePreference === opt.key
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setTheme(opt.key)}
                aria-pressed={isSelected}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '7px 8px',
                  borderRadius: '7px',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected
                    ? '#ffffff'
                    : 'var(--admin-text-muted, rgba(255, 255, 255, 0.6))',
                  background: isSelected
                    ? 'var(--admin-brand, #0878FF)'
                    : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 8px rgba(8, 120, 255, 0.35)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  minHeight: '36px',
                }}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // 3. Settings Tab Selector (card variant)
  if (variant === 'settings') {
    const options: Array<{ key: ThemePreference; title: string; desc: string; icon: React.ReactNode }> = [
      {
        key: 'light',
        title: 'Light Theme',
        desc: 'Clean, crisp mountain hospitality aesthetic',
        icon: <FiSun size={20} style={{ color: '#F59E0B' }} />,
      },
      {
        key: 'dark',
        title: 'Dark Theme',
        desc: 'Deep midnight navy tourism SaaS palette',
        icon: <FiMoon size={20} style={{ color: '#38BDF8' }} />,
      },
      {
        key: 'system',
        title: 'System Theme',
        desc: 'Synchronizes automatically with device OS preference',
        icon: <FiMonitor size={20} style={{ color: '#A78BFA' }} />,
      },
    ]

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }} className={className}>
        {options.map((opt) => {
          const isSelected = themePreference === opt.key
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setTheme(opt.key)}
              aria-pressed={isSelected}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '1rem',
                borderRadius: '10px',
                background: isSelected
                  ? 'var(--admin-brand-bg, rgba(8, 120, 255, 0.12))'
                  : 'var(--admin-card, rgba(255, 255, 255, 0.04))',
                border: isSelected
                  ? '2px solid var(--admin-brand, #0878FF)'
                  : '1px solid var(--admin-card-border, rgba(255, 255, 255, 0.1))',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ marginTop: '2px', flexShrink: 0 }}>{opt.icon}</div>
              <div>
                <p
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: isSelected
                      ? 'var(--admin-brand, #0878FF)'
                      : 'var(--admin-text, #ffffff)',
                    marginBottom: '4px',
                  }}
                >
                  {opt.title}
                </p>
                <p
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--admin-text-secondary, rgba(255, 255, 255, 0.6))',
                    lineHeight: 1.4,
                  }}
                >
                  {opt.desc}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  // 4. Default: Desktop Header Segmented Pill (>= lg)
  const desktopOptions: Array<{ key: ThemePreference; title: string; icon: React.ReactNode }> = [
    { key: 'light', title: 'Light', icon: <FiSun size={14} /> },
    { key: 'dark', title: 'Dark', icon: <FiMoon size={14} /> },
    { key: 'system', title: 'System', icon: <FiMonitor size={14} /> },
  ]

  return (
    <div
      role="group"
      aria-label="Theme mode switcher"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--admin-input-bg, rgba(0, 0, 0, 0.25))',
        border: '1px solid var(--admin-border, rgba(255, 255, 255, 0.12))',
        borderRadius: '9999px',
        padding: '3px',
        gap: '2px',
      }}
      className={className}
    >
      {desktopOptions.map((opt) => {
        const isSelected = themePreference === opt.key
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => setTheme(opt.key)}
            aria-pressed={isSelected}
            title={`Switch to ${opt.title} mode`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '9999px',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: isSelected ? 700 : 500,
              cursor: 'pointer',
              color: isSelected
                ? '#ffffff'
                : 'var(--admin-text-muted, rgba(255, 255, 255, 0.6))',
              background: isSelected
                ? 'var(--admin-brand, #0878FF)'
                : 'transparent',
              boxShadow: isSelected ? '0 2px 8px rgba(8, 120, 255, 0.35)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {opt.icon}
            <span>{opt.title}</span>
          </button>
        )
      })}
    </div>
  )
}
