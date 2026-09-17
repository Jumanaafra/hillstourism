'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import {
  FiCheckCircle,
  FiAlertCircle,
  FiAlertTriangle,
  FiInfo,
  FiX,
  FiLoader,
} from 'react-icons/fi'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  title?: string
  duration?: number
}

interface ToastContextValue {
  toasts: ToastItem[]
  toast: {
    success: (message: string, title?: string, duration?: number) => string
    error: (message: string, title?: string, duration?: number) => string
    warning: (message: string, title?: string, duration?: number) => string
    info: (message: string, title?: string, duration?: number) => string
    loading: (message: string, title?: string) => string
    dismiss: (id: string) => void
    update: (id: string, type: ToastType, message: string, title?: string, duration?: number) => void
  }
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useAdminToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useAdminToast must be used within a ToastProvider')
  }
  return ctx.toast
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const dismiss = useCallback((id: string) => {
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id)!)
      timersRef.current.delete(id)
    }
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((type: ToastType, message: string, title?: string, duration = 4500): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    const newToast: ToastItem = { id, type, message, title, duration }

    setToasts(prev => [newToast, ...prev.slice(0, 4)]) // keep max 5 toasts

    if (type !== 'loading' && duration > 0) {
      const timer = setTimeout(() => {
        dismiss(id)
      }, duration)
      timersRef.current.set(id, timer)
    }

    return id
  }, [dismiss])

  const update = useCallback((id: string, type: ToastType, message: string, title?: string, duration = 4500) => {
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id)!)
      timersRef.current.delete(id)
    }

    setToasts(prev => prev.map(t => t.id === id ? { ...t, type, message, title, duration } : t))

    if (type !== 'loading' && duration > 0) {
      const timer = setTimeout(() => {
        dismiss(id)
      }, duration)
      timersRef.current.set(id, timer)
    }
  }, [dismiss])

  const toastMethods = {
    success: (msg: string, title?: string, duration?: number) => addToast('success', msg, title, duration),
    error: (msg: string, title?: string, duration?: number) => addToast('error', msg, title, duration || 6000),
    warning: (msg: string, title?: string, duration?: number) => addToast('warning', msg, title, duration),
    info: (msg: string, title?: string, duration?: number) => addToast('info', msg, title, duration),
    loading: (msg: string, title?: string) => addToast('loading', msg, title, 0),
    dismiss,
    update,
  }

  return (
    <ToastContext.Provider value={{ toasts, toast: toastMethods }}>
      {children}
      
      {/* Floating Toast Notification Viewport */}
      <aside
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          maxWidth: 'min(420px, calc(100vw - 2rem))',
          width: '100%',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => {
          let bg = 'rgba(15, 23, 42, 0.95)'
          let borderColor = 'rgba(255, 255, 255, 0.15)'
          let textColor = '#ffffff'
          let iconColor = '#38bdf8'
          let IconComponent = FiInfo

          if (t.type === 'success') {
            bg = 'rgba(6, 44, 28, 0.96)'
            borderColor = 'rgba(34, 197, 94, 0.4)'
            iconColor = '#4ade80'
            IconComponent = FiCheckCircle
          } else if (t.type === 'error') {
            bg = 'rgba(50, 15, 18, 0.96)'
            borderColor = 'rgba(239, 68, 68, 0.45)'
            iconColor = '#f87171'
            IconComponent = FiAlertCircle
          } else if (t.type === 'warning') {
            bg = 'rgba(50, 35, 10, 0.96)'
            borderColor = 'rgba(245, 158, 11, 0.45)'
            iconColor = '#fbbf24'
            IconComponent = FiAlertTriangle
          } else if (t.type === 'loading') {
            bg = 'rgba(10, 30, 60, 0.96)'
            borderColor = 'rgba(56, 189, 248, 0.4)'
            iconColor = '#38bdf8'
            IconComponent = FiLoader
          }

          return (
            <div
              key={t.id}
              role={t.type === 'error' ? 'alert' : 'status'}
              style={{
                pointerEvents: 'auto',
                background: bg,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${borderColor}`,
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                color: textColor,
                animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ marginTop: '2px', flexShrink: 0, color: iconColor }}>
                <IconComponent
                  size={18}
                  style={{
                    animation: t.type === 'loading' ? 'spin 1s linear infinite' : 'none',
                  }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {t.title && (
                  <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.3 }}>
                    {t.title}
                  </h4>
                )}
                <p style={{ margin: t.title ? '2px 0 0 0' : 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.4, wordBreak: 'break-word' }}>
                  {t.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  flexShrink: 0,
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              >
                <FiX size={15} />
              </button>
            </div>
          )
        })}
      </aside>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
