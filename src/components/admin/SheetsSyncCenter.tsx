'use client'

import React, { useState } from 'react'
import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
  FiFileText,
  FiCheck,
} from 'react-icons/fi'
import { FaGoogle } from 'react-icons/fa'
import type { EnquiryData } from './MobileEnquiryCard'

interface SheetsSyncCenterProps {
  enquiries: EnquiryData[]
  onSyncCompleted: () => void
}

export default function SheetsSyncCenter({
  enquiries,
  onSyncCompleted,
}: SheetsSyncCenterProps) {
  const [syncingMode, setSyncingMode] = useState<'all_pending' | 'retry_failed' | null>(null)
  const [syncResult, setSyncResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const syncedCount = enquiries.filter(e => e.integrations?.sheetsStatus === 'synced').length
  const pendingCount = enquiries.filter(
    e => !e.integrations?.sheetsStatus || e.integrations.sheetsStatus === 'pending'
  ).length
  const failedCount = enquiries.filter(e => e.integrations?.sheetsStatus === 'failed').length

  const handleBatchSync = async (mode: 'all_pending' | 'retry_failed') => {
    setSyncingMode(mode)
    setSyncResult(null)

    try {
      const res = await fetch('/api/admin/crm/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'batch_sync',
          mode,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setSyncResult({
          type: 'success',
          message: `Batch sync complete! Processed ${data.data.total} records: ${data.data.synced} synced, ${data.data.failed} failed.`,
        })
        onSyncCompleted()
      } else {
        setSyncResult({
          type: 'error',
          message: data.error?.message || 'Batch sync failed.',
        })
      }
    } catch (err: any) {
      setSyncResult({
        type: 'error',
        message: err?.message || 'Network error during Google Sheets sync.',
      })
    } finally {
      setSyncingMode(null)
      setTimeout(() => {
        setSyncResult(null)
      }, 6000)
    }
  }

  return (
    <div
      style={{
        background: 'var(--admin-card)',
        border: '1px solid var(--admin-card-border)',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
      }}
    >
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#22C55E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FaGoogle size={14} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--admin-text)' }}>
              Google Sheets Synchronization Center
            </h4>
            <p style={{ margin: '1px 0 0 0', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
              Operational spreadsheet export & batch recovery
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            disabled={syncingMode !== null || pendingCount === 0}
            onClick={() => handleBatchSync('all_pending')}
            className="btn-primary"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              opacity: syncingMode !== null || pendingCount === 0 ? 0.6 : 1,
              cursor: syncingMode !== null || pendingCount === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <FiRefreshCw
              size={13}
              style={{ animation: syncingMode === 'all_pending' ? 'spin 1s linear infinite' : 'none' }}
            />
            {syncingMode === 'all_pending' ? 'Syncing...' : `Sync All Pending (${pendingCount})`}
          </button>

          {failedCount > 0 && (
            <button
              type="button"
              disabled={syncingMode !== null}
              onClick={() => handleBatchSync('retry_failed')}
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#FCA5A5',
                cursor: syncingMode !== null ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
              }}
            >
              <FiAlertCircle size={13} />
              {syncingMode === 'retry_failed' ? 'Retrying...' : `Retry Failed (${failedCount})`}
            </button>
          )}
        </div>
      </div>

      {/* Sync Metric Chips */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '6px',
            background: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            fontSize: '0.75rem',
            color: '#86EFAC',
            fontWeight: 600,
          }}
        >
          <FiCheckCircle size={13} color="#22C55E" />
          <span>Synced: <strong>{syncedCount}</strong></span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '6px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            fontSize: '0.75rem',
            color: '#FDE68A',
            fontWeight: 600,
          }}
        >
          <FiClock size={13} color="#F59E0B" />
          <span>Pending: <strong>{pendingCount}</strong></span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '6px',
            background: failedCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${failedCount > 0 ? 'rgba(239, 68, 68, 0.3)' : 'var(--admin-border)'}`,
            fontSize: '0.75rem',
            color: failedCount > 0 ? '#FCA5A5' : 'var(--admin-text-muted)',
            fontWeight: 600,
          }}
        >
          <FiAlertCircle size={13} color={failedCount > 0 ? '#EF4444' : 'currentColor'} />
          <span>Failed: <strong>{failedCount}</strong></span>
        </div>
      </div>

      {/* Result Toast Notification */}
      {syncResult && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            background: syncResult.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${syncResult.type === 'success' ? '#22C55E' : '#EF4444'}`,
            color: syncResult.type === 'success' ? '#86EFAC' : '#FCA5A5',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {syncResult.type === 'success' ? <FiCheck size={14} /> : <FiAlertCircle size={14} />}
          <span>{syncResult.message}</span>
        </div>
      )}
    </div>
  )
}
