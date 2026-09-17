'use client'

import React, { useState, useEffect } from 'react'
import {
  FiX,
  FiActivity,
  FiRefreshCw,
  FiUser,
  FiClock,
  FiMail,
  FiCheckCircle,
  FiFileText,
  FiTrash2,
} from 'react-icons/fi'
import type { AuditLogEntry } from '@/types/domain'

interface AuditLogModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuditLogModal({ isOpen, onClose }: AuditLogModalProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [filterAction, setFilterAction] = useState<string>('')

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const url = filterAction
        ? `/api/admin/crm/audit?limit=60&action=${encodeURIComponent(filterAction)}`
        : `/api/admin/crm/audit?limit=60`
      const res = await fetch(url)
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setLogs(data.data)
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchLogs()
    }
  }, [isOpen, filterAction])

  // ESC key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'email_sent':
        return { label: 'Email Sent', bg: 'rgba(34, 197, 94, 0.2)', text: '#86EFAC', icon: <FiMail size={12} /> }
      case 'status_update':
        return { label: 'Status Update', bg: 'rgba(245, 158, 11, 0.2)', text: '#FDE68A', icon: <FiActivity size={12} /> }
      case 'sheet_sync':
      case 'batch_sync':
        return { label: 'Sheet Sync', bg: 'rgba(59, 130, 246, 0.2)', text: '#93C5FD', icon: <FiCheckCircle size={12} /> }
      case 'note_added':
        return { label: 'Internal Note', bg: 'rgba(168, 85, 247, 0.2)', text: '#D8B4FE', icon: <FiFileText size={12} /> }
      case 'enquiry_deleted':
        return { label: 'Archived', bg: 'rgba(239, 68, 68, 0.2)', text: '#FCA5A5', icon: <FiTrash2 size={12} /> }
      default:
        return { label: action, bg: 'rgba(255, 255, 255, 0.1)', text: '#ffffff', icon: <FiActivity size={12} /> }
    }
  }

  const formatTimestamp = (ts: string) => {
    try {
      return new Date(ts).toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return ts
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-modal-title"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--admin-modal-overlay)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Modal Dialog */}
      <div
        style={{
          position: 'relative',
          zIndex: 55,
          width: '100%',
          maxWidth: '850px',
          maxHeight: '85vh',
          background: 'var(--admin-modal-bg)',
          border: '1px solid var(--admin-modal-border)',
          borderRadius: '16px',
          boxShadow: 'var(--admin-card-shadow, 0 20px 40px rgba(0,0,0,0.5))',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: 'var(--admin-text)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--admin-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#A855F7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiActivity size={18} />
            </div>
            <div>
              <h3
                id="audit-modal-title"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                CRM Audit Log & Activity Trail
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                Immutable administrative record of statuses, emails, notes, and sheet syncs
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={fetchLogs}
              disabled={loading}
              title="Refresh logs"
              style={{
                background: 'var(--admin-card)',
                border: '1px solid var(--admin-border)',
                color: 'var(--admin-text)',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
              }}
            >
              <FiRefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>

            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--admin-text-muted)',
                cursor: 'pointer',
                fontSize: '1.25rem',
                padding: '4px',
              }}
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Filter Strip */}
        <div
          style={{
            padding: '8px 1.5rem',
            borderBottom: '1px solid var(--admin-border)',
            background: 'var(--admin-table-header)',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
          }}
        >
          {[
            { label: 'All Activities', value: '' },
            { label: 'Status Updates', value: 'status_update' },
            { label: 'Emails', value: 'email_sent' },
            { label: 'Sheet Syncs', value: 'sheet_sync' },
            { label: 'Internal Notes', value: 'note_added' },
            { label: 'Deletions', value: 'enquiry_deleted' },
          ].map(f => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilterAction(f.value)}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: filterAction === f.value ? 700 : 500,
                background: filterAction === f.value ? 'var(--hill-blue-bright)' : 'transparent',
                color: filterAction === f.value ? '#ffffff' : 'var(--admin-text-muted)',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Logs Table / List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
          {logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
              {loading ? 'Loading audit records...' : 'No audit entries found matching the filter.'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--admin-border)', color: 'var(--admin-text-muted)', background: 'var(--admin-table-header)' }}>
                  <th style={{ padding: '10px 16px' }}>Timestamp</th>
                  <th style={{ padding: '10px 16px' }}>Action</th>
                  <th style={{ padding: '10px 16px' }}>Enquiry / Target</th>
                  <th style={{ padding: '10px 16px' }}>Details</th>
                  <th style={{ padding: '10px 16px' }}>Admin</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const badge = getActionBadge(log.action)
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                      <td style={{ padding: '10px 16px', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: badge.bg,
                            color: badge.text,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                          }}
                        >
                          {badge.icon} {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                        {log.enquiryId ? (
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--hill-blue-bright)' }}>
                            {log.enquiryId}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--admin-text-muted)' }}>—</span>
                        )}
                        {log.customerName && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>
                            {log.customerName}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--admin-text)', lineHeight: 1.4 }}>
                        {log.details}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--admin-text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <FiUser size={11} /> {log.adminEmail}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
