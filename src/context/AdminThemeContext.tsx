'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface AdminThemeContextValue {
  themePreference: ThemePreference
  resolvedTheme: ResolvedTheme
  setTheme: (pref: ThemePreference) => Promise<void>
  cycleTheme: () => void
  syncFromFirestore: (remoteTheme?: string) => void
}

const AdminThemeContext = createContext<AdminThemeContextValue | undefined>(undefined)

const LOCAL_STORAGE_KEY = 'hills_admin_theme_pref'

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system')
  const [resolvedTheme, setResolvedThemeState] = useState<ResolvedTheme>('dark')
  const [isMounted, setIsMounted] = useState(false)

  // Apply resolved theme attribute to <html> tag
  const applyThemeToDOM = useCallback((theme: ResolvedTheme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-admin-theme', theme)
    }
  }, [])

  // Initialize theme from localStorage or system on mount
  useEffect(() => {
    setIsMounted(true)
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY) as ThemePreference | null
      const validPrefs: ThemePreference[] = ['light', 'dark', 'system']
      const pref: ThemePreference = saved && validPrefs.includes(saved) ? saved : 'system'
      setThemePreferenceState(pref)

      const resolved: ResolvedTheme = pref === 'system' ? getSystemTheme() : pref
      setResolvedThemeState(resolved)
      applyThemeToDOM(resolved)
    } catch {
      const fallback = getSystemTheme()
      setResolvedThemeState(fallback)
      applyThemeToDOM(fallback)
    }
  }, [applyThemeToDOM])

  // Listen to OS system theme changes when preference is 'system'
  useEffect(() => {
    if (!isMounted || themePreference !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const newResolved: ResolvedTheme = e.matches ? 'dark' : 'light'
      setResolvedThemeState(newResolved)
      applyThemeToDOM(newResolved)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [isMounted, themePreference, applyThemeToDOM])

  // Explicitly update theme preference (localStorage + Firestore)
  const setTheme = useCallback(async (newPref: ThemePreference) => {
    setThemePreferenceState(newPref)
    const newResolved: ResolvedTheme = newPref === 'system' ? getSystemTheme() : newPref
    setResolvedThemeState(newResolved)
    applyThemeToDOM(newResolved)

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, newPref)
    } catch (e) {
      console.warn('Failed to save theme in localStorage:', e)
    }

    // Persist to Firestore admin settings
    try {
      const token = typeof document !== 'undefined'
        ? (document.cookie.match(/(?:^|;\s*)admin_token=([^;]*)/)?.[1] || '')
        : ''
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${decodeURIComponent(token)}`

      await fetch('/api/admin/content', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          type: 'settings',
          data: { theme: newPref },
        }),
      }).catch(() => {})
    } catch (err) {
      console.warn('Failed to sync theme to Firestore:', err)
    }
  }, [applyThemeToDOM])

  // Sync preference from Firestore when admin dashboard loads (Firestore -> localStorage -> System)
  const syncFromFirestore = useCallback((remoteTheme?: string) => {
    if (!remoteTheme) return
    const valid: ThemePreference[] = ['light', 'dark', 'system']
    if (valid.includes(remoteTheme as ThemePreference)) {
      const pref = remoteTheme as ThemePreference
      setThemePreferenceState(pref)
      const resolved = pref === 'system' ? getSystemTheme() : pref
      setResolvedThemeState(resolved)
      applyThemeToDOM(resolved)
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, pref)
      } catch {}
    }
  }, [applyThemeToDOM])

  // Cycle through themes: light -> dark -> system -> light
  const cycleTheme = useCallback(() => {
    if (themePreference === 'light') {
      setTheme('dark')
    } else if (themePreference === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }, [themePreference, setTheme])

  return (
    <AdminThemeContext.Provider
      value={{
        themePreference,
        resolvedTheme,
        setTheme,
        cycleTheme,
        syncFromFirestore,
      }}
    >
      {children}
    </AdminThemeContext.Provider>
  )
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext)
  if (!context) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider')
  }
  return context
}
