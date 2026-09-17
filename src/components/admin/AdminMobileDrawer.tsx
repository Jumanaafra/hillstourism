'use client'

import React, { useEffect } from 'react'
import {
  FiX,
  FiBarChart2,
  FiInbox,
  FiPackage,
  FiHome,
  FiTruck,
  FiImage,
  FiLayers,
  FiMessageSquare,
  FiFolder,
  FiShare2,
  FiGlobe,
  FiSliders,
  FiExternalLink,
  FiLogOut,
  FiArrowRight,
} from 'react-icons/fi'
import ThemeToggle from './ThemeToggle'

export type TabKey =
  | 'overview'
  | 'enquiries'
  | 'packages'
  | 'hotels'
  | 'vehicles'
  | 'gallery'
  | 'content'
  | 'knowledge'
  | 'library'
  | 'social'
  | 'seo'
  | 'settings'

interface TabItem {
  key: TabKey
  label: string
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
  count?: number | string
  badgeColor?: string
}

interface AdminMobileDrawerProps {
  isOpen: boolean
  activeTab: TabKey
  newEnquiriesCount: number
  totalPackagesCount: number
  totalHotelsCount: number
  totalVehiclesCount: number
  onSelectTab: (tab: TabKey) => void
  onClose: () => void
  onLogout: () => void
}

export default function AdminMobileDrawer({
  isOpen,
  activeTab,
  newEnquiriesCount,
  totalPackagesCount,
  totalHotelsCount,
  totalVehiclesCount,
  onSelectTab,
  onClose,
  onLogout,
}: AdminMobileDrawerProps) {
  // Lock body scroll and handle ESC key when open
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const TABS: TabItem[] = [
    { key: 'overview', label: 'Overview', icon: FiBarChart2 },
    {
      key: 'enquiries',
      label: 'Enquiries',
      icon: FiInbox,
      count: newEnquiriesCount > 0 ? `${newEnquiriesCount} New` : undefined,
      badgeColor: '#22C55E',
    },
    {
      key: 'packages',
      label: 'Packages',
      icon: FiPackage,
      count: totalPackagesCount > 0 ? totalPackagesCount : undefined,
    },
    {
      key: 'hotels',
      label: 'Hotels',
      icon: FiHome,
      count: totalHotelsCount > 0 ? totalHotelsCount : undefined,
    },
    {
      key: 'vehicles',
      label: 'Vehicles',
      icon: FiTruck,
      count: totalVehiclesCount > 0 ? totalVehiclesCount : undefined,
    },
    { key: 'gallery', label: 'Gallery', icon: FiImage },
    { key: 'content', label: 'Content CMS', icon: FiLayers },
    { key: 'knowledge', label: 'Chat Knowledge', icon: FiMessageSquare },
    { key: 'library', label: 'Image Library', icon: FiFolder },
    { key: 'social', label: 'Social Links', icon: FiShare2 },
    { key: 'seo', label: 'SEO CMS', icon: FiGlobe },
    { key: 'settings', label: 'Site Settings', icon: FiSliders },
  ]

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Admin navigation drawer"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--admin-modal-overlay, rgba(0, 0, 0, 0.65))',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Drawer Panel */}
      <div
        className="admin-drawer"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '82%',
          maxWidth: '320px',
          background: 'var(--admin-sidebar-bg, var(--admin-surface, #00091F))',
          borderRight: '1px solid var(--admin-border, rgba(255, 255, 255, 0.12))',
          boxShadow: 'var(--admin-shadow-md, 0 20px 40px rgba(0, 0, 0, 0.8))',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 51,
          animation: 'slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1rem 1rem',
            borderBottom: '1px solid var(--admin-border, rgba(255, 255, 255, 0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: 'var(--admin-text, #ffffff)',
                }}
              >
                Hills Tourism
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'var(--admin-brand-bg, rgba(8, 120, 255, 0.2))',
                  color: 'var(--admin-brand, #0878FF)',
                  fontWeight: 700,
                }}
              >
                PORTAL
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted, rgba(255, 255, 255, 0.5))', marginTop: '2px' }}>
              Operations Dashboard
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--admin-card, rgba(255, 255, 255, 0.06))',
              border: '1px solid var(--admin-card-border, rgba(255, 255, 255, 0.1))',
              color: 'var(--admin-text, #ffffff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.75rem 0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  onSelectTab(tab.key)
                  onClose()
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive
                    ? 'var(--admin-brand, #0878FF)'
                    : 'var(--admin-text, rgba(255, 255, 255, 0.75))',
                  background: isActive
                    ? 'var(--admin-brand-bg, rgba(8, 120, 255, 0.15))'
                    : 'transparent',
                  border: isActive
                    ? '1px solid var(--admin-brand, rgba(8, 120, 255, 0.5))'
                    : '1px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  minHeight: '44px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon
                    size={18}
                    style={{
                      color: isActive ? 'var(--admin-brand, #0878FF)' : 'var(--admin-text-muted, rgba(255, 255, 255, 0.5))',
                      flexShrink: 0,
                    }}
                  />
                  <span>{tab.label}</span>
                </div>

                {tab.count !== undefined && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: tab.badgeColor
                        ? 'rgba(34, 197, 94, 0.15)'
                        : 'var(--admin-badge-bg, rgba(255, 255, 255, 0.1))',
                      color: tab.badgeColor || 'var(--admin-badge-text, #ffffff)',
                      border: tab.badgeColor ? '1px solid rgba(34, 197, 94, 0.4)' : 'none',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Drawer Footer Actions */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--admin-border, rgba(255, 255, 255, 0.08))',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            background: 'var(--admin-surface-alt, rgba(0, 0, 0, 0.2))',
          }}
        >
          {/* Mobile Drawer Theme Switcher */}
          <ThemeToggle variant="mobile-drawer" />

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'var(--admin-card, rgba(255, 255, 255, 0.05))',
              border: '1px solid var(--admin-card-border, rgba(255, 255, 255, 0.1))',
              color: 'var(--admin-brand, #0878FF)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              minHeight: '44px',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiExternalLink size={16} /> View Public Website
            </span>
            <FiArrowRight size={14} />
          </a>

          <button
            type="button"
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#EF4444',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            <FiLogOut size={16} /> Logout from Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
