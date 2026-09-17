'use client'

import React from 'react'
import { FiMenu, FiRefreshCw } from 'react-icons/fi'

interface MobileAdminHeaderProps {
  activeTabLabel: string
  newEnquiriesCount: number
  refreshing: boolean
  onOpenDrawer: () => void
  onRefresh: () => void
}

export default function MobileAdminHeader({
  activeTabLabel,
  newEnquiriesCount,
  refreshing,
  onOpenDrawer,
  onRefresh,
}: MobileAdminHeaderProps) {
  return (
    <header
      className="lg:hidden sticky top-0 z-30 w-full"
      style={{
        background: 'rgba(0, 9, 31, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0.65rem 0.85rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        {/* Left: Hamburger + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <button
            type="button"
            onClick={onOpenDrawer}
            aria-label="Open navigation menu"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <FiMenu size={20} />
          </button>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Hills Tourism
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: 'rgba(8, 120, 255, 0.2)',
                  color: 'var(--hill-blue-bright, #0878FF)',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                ADMIN
              </span>
            </div>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.6)',
                margin: 0,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Section: <span style={{ color: '#86EFAC', fontWeight: 600 }}>{activeTabLabel}</span>
            </p>
          </div>
        </div>

        {/* Right: Quick actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {newEnquiriesCount > 0 && (
            <span
              style={{
                padding: '3px 8px',
                borderRadius: '12px',
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                color: '#86EFAC',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title={`${newEnquiriesCount} new enquiries`}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
              {newEnquiriesCount} New
            </span>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh dashboard data"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              opacity: refreshing ? 0.7 : 1,
            }}
          >
            <FiRefreshCw
              size={16}
              style={{
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
              }}
            />
          </button>
        </div>
      </div>
    </header>
  )
}
