'use client'

import React, { useState, useEffect } from 'react'
import {
  FiX,
  FiPhone,
  FiMail,
  FiCalendar,
  FiUsers,
  FiMapPin,
  FiHome,
  FiTruck,
  FiCheck,
  FiAlertTriangle,
  FiClock,
  FiTrash2,
  FiSave,
  FiSend,
  FiRefreshCw,
  FiActivity,
  FiFileText,
  FiCheckCircle,
} from 'react-icons/fi'
import { FaWhatsapp, FaGoogle } from 'react-icons/fa'
import type { EnquiryData } from './MobileEnquiryCard'
import EnquiryTimeline from './EnquiryTimeline'
import InternalNotes from './InternalNotes'

interface EnquiryDetailModalProps {
  enquiry: EnquiryData | null
  isOpen: boolean
  onClose: () => void
  onUpdateStatus: (id: string, newStatus: string) => Promise<void> | void
  onArchive: (id: string) => void
  onOpenEmailComposer?: (enquiry: EnquiryData) => void
  onEnquiryUpdated?: (updated: EnquiryData) => void
  onSyncCompleted?: () => void
}

type ModalTab = 'details' | 'timeline' | 'notes' | 'emails'

export const CRM_STATUS_OPTIONS: Array<{ value: string; label: string; color: string; bg: string }> = [
  { value: 'new', label: 'New Lead', color: '#86EFAC', bg: 'rgba(34, 197, 94, 0.2)' },
  { value: 'contacted', label: 'Contacted', color: '#FDE68A', bg: 'rgba(245, 158, 11, 0.2)' },
  { value: 'quotation_sent', label: 'Quotation Sent', color: '#BAE6FD', bg: 'rgba(14, 165, 233, 0.2)' },
  { value: 'confirmed', label: 'Confirmed', color: '#C7D2FE', bg: 'rgba(99, 102, 241, 0.2)' },
  { value: 'payment_pending', label: 'Payment Pending', color: '#DDD6FE', bg: 'rgba(139, 92, 246, 0.2)' },
  { value: 'booked', label: 'Booked', color: '#5EEAD4', bg: 'rgba(20, 184, 166, 0.2)' },
  { value: 'completed', label: 'Completed', color: '#E2E8F0', bg: 'rgba(148, 163, 184, 0.2)' },
  { value: 'cancelled', label: 'Cancelled', color: '#FCA5A5', bg: 'rgba(239, 68, 68, 0.2)' },
  { value: 'spam', label: 'Spam / Archived', color: '#CBD5E1', bg: 'rgba(100, 116, 139, 0.2)' },
  { value: 'in_progress', label: 'In Progress (Legacy)', color: '#93C5FD', bg: 'rgba(59, 130, 246, 0.2)' },
  { value: 'closed', label: 'Closed (Legacy)', color: '#CBD5E1', bg: 'rgba(255, 255, 255, 0.1)' },
]

export default function EnquiryDetailModal({
  enquiry,
  isOpen,
  onClose,
  onUpdateStatus,
  onArchive,
  onOpenEmailComposer,
  onEnquiryUpdated,
  onSyncCompleted,
}: EnquiryDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('new')
  const [saving, setSaving] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<ModalTab>('details')
  const [syncingSheet, setSyncingSheet] = useState<boolean>(false)
  const [syncMsg, setSyncMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (enquiry) {
      setSelectedStatus(enquiry.status || 'new')
      setActiveTab('details')
      setSyncMsg(null)
    }
  }, [enquiry])

  // ESC key and body scroll lock
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !enquiry) return null

  const handleSaveStatus = async () => {
    setSaving(true)
    try {
      await onUpdateStatus(enquiry.id, selectedStatus)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleManualSheetSync = async () => {
    setSyncingSheet(true)
    setSyncMsg(null)

    try {
      const res = await fetch('/api/admin/crm/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_single',
          enquiryId: enquiry.id,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSyncMsg({
          type: 'success',
          text: `Synced to row #${data.data?.rowNumber || 'updated'}!`,
        })
        if (onEnquiryUpdated && data.data?.enquiry) {
          onEnquiryUpdated(data.data.enquiry)
        }
        if (onSyncCompleted) {
          onSyncCompleted()
        }
      } else {
        setSyncMsg({
          type: 'error',
          text: data.error?.message || 'Sync failed.',
        })
      }
    } catch (err: any) {
      setSyncMsg({ type: 'error', text: err?.message || 'Network error.' })
    } finally {
      setSyncingSheet(false)
      setTimeout(() => setSyncMsg(null), 4000)
    }
  }

  const cleanPhone = (enquiry.customer?.phone || '').replace(/[^0-9+]/g, '')
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone}`
    : ''

  const cardSectionStyle: React.CSSProperties = {
    background: 'var(--admin-card, rgba(255, 255, 255, 0.03))',
    borderRadius: '10px',
    border: '1px solid var(--admin-border, rgba(255, 255, 255, 0.07))',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  }

  const currentStatusConfig = CRM_STATUS_OPTIONS.find(s => s.value === selectedStatus) || CRM_STATUS_OPTIONS[0]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-modal-title"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--admin-modal-overlay, rgba(0, 0, 0, 0.75))',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal / Bottom Sheet Box */}
      <div
        style={{
          position: 'relative',
          zIndex: 52,
          width: '100%',
          maxWidth: '640px',
          maxHeight: '94vh',
          background: 'var(--admin-modal-bg, #0a1738)',
          border: '1px solid var(--admin-modal-border, rgba(255, 255, 255, 0.12))',
          borderRadius: '16px 16px 0 0',
          boxShadow: 'var(--admin-card-shadow, 0 -10px 40px rgba(0, 0, 0, 0.8))',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: 'var(--admin-text)',
        }}
        className="sm:rounded-2xl"
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.25rem 0.85rem',
            borderBottom: '1px solid var(--admin-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: 'var(--hill-blue-bright)',
                  fontWeight: 700,
                  background: 'rgba(8, 120, 255, 0.12)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {enquiry.id}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: currentStatusConfig.bg,
                  color: currentStatusConfig.color,
                }}
              >
                {currentStatusConfig.label}
              </span>
            </div>
            <h3
              id="enquiry-modal-title"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--admin-text)',
                margin: '4px 0 0 0',
              }}
            >
              {enquiry.customer?.name || 'Customer Enquiry'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--admin-card)',
              border: '1px solid var(--admin-border)',
              color: 'var(--admin-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Modal Section Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            padding: '6px 1.25rem',
            borderBottom: '1px solid var(--admin-border)',
            background: 'var(--admin-table-header)',
            overflowX: 'auto',
          }}
        >
          {[
            { key: 'details', label: 'Enquiry Details', icon: <FiFileText size={13} /> },
            { key: 'timeline', label: `Timeline (${(enquiry.timeline || []).length})`, icon: <FiActivity size={13} /> },
            { key: 'notes', label: `Internal Notes (${(enquiry.notes || []).length})`, icon: <FiFileText size={13} /> },
            { key: 'emails', label: `Email History (${(enquiry.emailHistory || []).length})`, icon: <FiMail size={13} /> },
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as ModalTab)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: activeTab === tab.key ? 700 : 500,
                background: activeTab === tab.key ? 'var(--hill-blue-bright)' : 'transparent',
                color: activeTab === tab.key ? '#ffffff' : 'var(--admin-text-muted)',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <>
              {/* Quick Communication Action Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '0.6rem' }}>
                {cleanPhone && (
                  <a
                    href={`tel:${cleanPhone}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(8, 120, 255, 0.15)',
                      border: '1px solid rgba(8, 120, 255, 0.35)',
                      color: 'var(--hill-blue-bright)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                    }}
                  >
                    <FiPhone size={15} /> Call
                  </a>
                )}

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(34, 197, 94, 0.15)',
                      border: '1px solid rgba(34, 197, 94, 0.35)',
                      color: '#86EFAC',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                    }}
                  >
                    <FaWhatsapp size={16} /> WhatsApp
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenEmailComposer) onOpenEmailComposer(enquiry)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(168, 85, 247, 0.15)',
                    border: '1px solid rgba(168, 85, 247, 0.35)',
                    color: '#D8B4FE',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  <FiSend size={14} /> Send Email
                </button>
              </div>

              {/* Section 1: Customer Contact Info */}
              <div style={cardSectionStyle}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Customer Details
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--admin-text-muted)' }}>Name:</span>
                    <span style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{enquiry.customer?.name || '—'}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--admin-text-muted)' }}>Phone:</span>
                    <span style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{enquiry.customer?.phone || '—'}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--admin-text-muted)' }}>Email:</span>
                    <span style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{enquiry.customer?.email || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Selected Tour Items */}
              <div style={cardSectionStyle}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Trip & Itinerary Snapshot
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiMapPin size={16} color="var(--hill-blue-bright)" />
                    <span style={{ color: 'var(--admin-text-muted)' }}>Package:</span>
                    <span style={{ fontWeight: 600, color: 'var(--admin-text)' }}>
                      {enquiry.package?.nameSnapshot || 'Custom Mountain Plan'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiHome size={16} color="#F59E0B" />
                    <span style={{ color: 'var(--admin-text-muted)' }}>Hotel:</span>
                    <span style={{ fontWeight: 600, color: 'var(--admin-text)' }}>
                      {enquiry.hotel?.nameSnapshot || 'Not selected'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiTruck size={16} color="#22C55E" />
                    <span style={{ color: 'var(--admin-text-muted)' }}>Vehicle:</span>
                    <span style={{ fontWeight: 600, color: 'var(--admin-text)' }}>
                      {enquiry.vehicle?.nameSnapshot || enquiry.vehicle?.numberPlateSnapshot || 'Not selected'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Travel Preferences & Dates */}
              <div style={cardSectionStyle}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Travel Preferences
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiCalendar size={15} color="var(--admin-text-muted)" />
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>Travel Date</div>
                      <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{enquiry.travel?.date || 'Flexible'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiUsers size={15} color="var(--admin-text-muted)" />
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>Group Size</div>
                      <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>
                        {enquiry.travel?.groupSize ? `${enquiry.travel.groupSize} Guests` : 'Not specified'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Customer Message */}
              {enquiry.message && (
                <div style={cardSectionStyle}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Customer Message
                  </span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--admin-text)', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {enquiry.message}
                  </p>
                </div>
              )}

              {/* Section 5: Integrations & Google Sheets Control */}
              <div style={cardSectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Automations & Sheets Sync
                  </span>
                  <button
                    type="button"
                    disabled={syncingSheet}
                    onClick={handleManualSheetSync}
                    className="btn-primary"
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.72rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: syncingSheet ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <FiRefreshCw size={11} style={{ animation: syncingSheet ? 'spin 1s linear infinite' : 'none' }} />
                    {syncingSheet ? 'Syncing...' : enquiry.integrations?.sheetsStatus === 'synced' ? 'Resync Sheet' : 'Sync Now'}
                  </button>
                </div>

                {syncMsg && (
                  <div
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: syncMsg.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: syncMsg.type === 'success' ? '#86EFAC' : '#FCA5A5',
                      fontSize: '0.75rem',
                    }}
                  >
                    {syncMsg.text}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                  {/* Email Delivery */}
                  <div
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: enquiry.integrations?.emailStatus === 'sent' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--admin-border)',
                      color: enquiry.integrations?.emailStatus === 'sent' ? '#86EFAC' : 'var(--admin-text)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <FiMail size={13} /> Email Notification
                    </div>
                    <span style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>
                      Status: {enquiry.integrations?.emailStatus || 'pending'}
                    </span>
                  </div>

                  {/* Google Sheets Sync */}
                  <div
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: enquiry.integrations?.sheetsStatus === 'synced' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid var(--admin-border)',
                      color: enquiry.integrations?.sheetsStatus === 'synced' ? '#86EFAC' : '#FDE68A',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <FaGoogle size={12} /> Google Sheets
                    </div>
                    <div style={{ fontSize: '0.7rem' }}>
                      Status: <strong style={{ textTransform: 'capitalize' }}>{enquiry.integrations?.sheetsStatus || 'pending'}</strong>
                      {enquiry.integrations?.sheetRow && (
                        <span> (Row #{enquiry.integrations.sheetRow})</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: TIMELINE */}
          {activeTab === 'timeline' && (
            <div style={cardSectionStyle}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Chronological Activity Timeline
              </span>
              <EnquiryTimeline
                timeline={enquiry.timeline}
                createdAt={enquiry.createdAt}
                customerName={enquiry.customer?.name}
              />
            </div>
          )}

          {/* TAB 3: INTERNAL NOTES */}
          {activeTab === 'notes' && (
            <div style={cardSectionStyle}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Internal Admin Notes
              </span>
              <InternalNotes
                enquiryId={enquiry.id}
                notes={enquiry.notes}
                onNotesUpdated={(updatedEnq) => {
                  if (onEnquiryUpdated) onEnquiryUpdated(updatedEnq)
                }}
              />
            </div>
          )}

          {/* TAB 4: EMAIL HISTORY */}
          {activeTab === 'emails' && (
            <div style={cardSectionStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Dispatched Email History
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenEmailComposer) onOpenEmailComposer(enquiry)
                  }}
                  className="btn-primary"
                  style={{ padding: '4px 10px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <FiSend size={11} /> Compose New Email
                </button>
              </div>

              {(!enquiry.emailHistory || enquiry.emailHistory.length === 0) ? (
                <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem', fontStyle: 'italic', margin: '0.5rem 0' }}>
                  No customer emails dispatched yet through the Email Center.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {enquiry.emailHistory.map(email => (
                    <div
                      key={email.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'var(--admin-card)',
                        border: '1px solid var(--admin-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--admin-text)' }}>
                          {email.subject}
                        </span>
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: email.status === 'sent' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: email.status === 'sent' ? '#86EFAC' : '#FCA5A5',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          {email.status}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>
                        <span>To: {email.to}</span>
                        <span>&bull;</span>
                        <span>Template: {email.template}</span>
                        <span>&bull;</span>
                        <span>{new Date(email.sentAt).toLocaleString()}</span>
                      </div>

                      {email.bodyText && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--admin-text)',
                            background: 'var(--admin-table-header)',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            marginTop: '4px',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '120px',
                            overflowY: 'auto',
                          }}
                        >
                          {email.bodyText}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls: Customer Status Workflow */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--admin-border)',
            background: 'var(--admin-table-header)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label
                htmlFor="modalEnquiryStatus"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--admin-text-muted)',
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: 600,
                }}
              >
                Customer Status Workflow Pipeline
              </label>
              <select
                id="modalEnquiryStatus"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--admin-input-border)',
                  background: 'var(--admin-input-bg)',
                  color: 'var(--admin-input-text)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  minHeight: '42px',
                  outline: 'none',
                }}
              >
                {CRM_STATUS_OPTIONS.map(opt => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    style={{ background: 'var(--admin-modal-bg)', color: 'var(--admin-text)' }}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleSaveStatus}
              disabled={saving}
              className="btn-primary"
              style={{
                flex: '1 1 auto',
                justifyContent: 'center',
                padding: '10px 18px',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                minHeight: '42px',
                opacity: saving ? 0.7 : 1,
              }}
            >
              <FiSave size={15} /> {saving ? 'Updating...' : 'Update Status'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => {
                onArchive(enquiry.id)
                onClose()
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#EF4444',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
              }}
            >
              <FiTrash2 size={13} /> Archive this Enquiry
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
