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
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import type { EnquiryData } from './MobileEnquiryCard'

interface EnquiryDetailModalProps {
  enquiry: EnquiryData | null
  isOpen: boolean
  onClose: () => void
  onUpdateStatus: (id: string, newStatus: string) => Promise<void> | void
  onArchive: (id: string) => void
}

export default function EnquiryDetailModal({
  enquiry,
  isOpen,
  onClose,
  onUpdateStatus,
  onArchive,
}: EnquiryDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('new')
  const [saving, setSaving] = useState<boolean>(false)

  useEffect(() => {
    if (enquiry) {
      setSelectedStatus(enquiry.status || 'new')
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

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdateStatus(enquiry.id, selectedStatus)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const cleanPhone = (enquiry.customer?.phone || '').replace(/[^0-9+]/g, '')
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone}`
    : ''

  const cardSectionStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  }

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
          background: 'rgba(0, 0, 0, 0.75)',
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
          maxWidth: '560px',
          maxHeight: '92vh',
          background: 'var(--hill-navy-deep, #00091F)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        className="sm:rounded-2xl"
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.25rem 1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                color: 'var(--hill-blue-bright, #0878FF)',
                fontWeight: 700,
              }}
            >
              {enquiry.id}
            </span>
            <h3
              id="enquiry-modal-title"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#ffffff',
                margin: '2px 0 0 0',
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
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <FiX size={20} />
          </button>
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
          {/* Quick Communication Action Bar */}
          {cleanPhone && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <a
                href={`tel:${cleanPhone}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(8, 120, 255, 0.2)',
                  border: '1px solid rgba(8, 120, 255, 0.4)',
                  color: 'var(--hill-blue-bright, #0878FF)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                }}
              >
                <FiPhone size={16} /> Call Direct
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  color: '#86EFAC',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                }}
              >
                <FaWhatsapp size={18} /> WhatsApp
              </a>
            </div>
          )}

          {/* Section 1: Customer Contact Info */}
          <div style={cardSectionStyle}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Customer Details
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Name:</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>{enquiry.customer?.name || '—'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Phone:</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>{enquiry.customer?.phone || '—'}</span>
              </div>

              {enquiry.customer?.email && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Email:</span>
                  <a
                    href={`mailto:${enquiry.customer.email}`}
                    style={{ color: 'var(--hill-blue-bright)', textDecoration: 'underline', fontSize: '0.8rem' }}
                  >
                    {enquiry.customer.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Trip & Selections */}
          <div style={cardSectionStyle}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Trip Requirements
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              {enquiry.package?.nameSnapshot && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <FiMapPin size={16} color="var(--hill-blue-bright)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', display: 'block' }}>Package Selected</span>
                    <span style={{ fontWeight: 600, color: '#86EFAC' }}>{enquiry.package.nameSnapshot}</span>
                  </div>
                </div>
              )}

              {enquiry.hotel?.nameSnapshot && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <FiHome size={16} color="#F59E0B" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', display: 'block' }}>Hotel / Stay</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{enquiry.hotel.nameSnapshot}</span>
                  </div>
                </div>
              )}

              {enquiry.vehicle?.nameSnapshot && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <FiTruck size={16} color="#A855F7" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', display: 'block' }}>Vehicle Fleet</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>
                      {enquiry.vehicle.nameSnapshot} {enquiry.vehicle.numberPlateSnapshot ? `(${enquiry.vehicle.numberPlateSnapshot})` : ''}
                    </span>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', display: 'block' }}>Travel Date</span>
                  <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>{enquiry.travel?.date || 'Flexible'}</span>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', display: 'block' }}>Group Size</span>
                  <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>
                    {enquiry.travel?.groupSize !== undefined ? `${enquiry.travel.groupSize} Guests` : 'Not specified'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Customer Message / Special Notes */}
          {enquiry.message && (
            <div style={cardSectionStyle}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Customer Message
              </span>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  margin: 0,
                  lineHeight: 1.5,
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {enquiry.message}
              </p>
            </div>
          )}

          {/* Section 4: Live Integration Status */}
          <div style={cardSectionStyle}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Backend Integration Deliveries
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
              <div
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: enquiry.integrations?.emailStatus === 'sent'
                    ? 'rgba(34, 197, 94, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${enquiry.integrations?.emailStatus === 'sent' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  color: enquiry.integrations?.emailStatus === 'sent' ? '#86EFAC' : '#FCA5A5',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <FiMail size={14} /> Resend Email
                </div>
                <span style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
                  {enquiry.integrations?.emailStatus || 'pending'}
                </span>
                {enquiry.integrations?.emailError && (
                  <p style={{ fontSize: '0.65rem', margin: '4px 0 0', opacity: 0.8 }}>
                    {enquiry.integrations.emailError}
                  </p>
                )}
              </div>

              <div
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: enquiry.integrations?.sheetsStatus === 'synced'
                    ? 'rgba(34, 197, 94, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${enquiry.integrations?.sheetsStatus === 'synced' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  color: enquiry.integrations?.sheetsStatus === 'synced' ? '#86EFAC' : '#FCA5A5',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <FiCheck size={14} /> Google Sheets
                </div>
                <span style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
                  {enquiry.integrations?.sheetsStatus || 'pending'}
                </span>
                {enquiry.integrations?.sheetsError && (
                  <p style={{ fontSize: '0.65rem', margin: '4px 0 0', opacity: 0.8 }}>
                    {enquiry.integrations.sheetsError}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label
                htmlFor="modalEnquiryStatus"
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: 600,
                }}
              >
                Update Status
              </label>
              <select
                id="modalEnquiryStatus"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: '#001040',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  minHeight: '44px',
                }}
              >
                <option value="new">New Lead</option>
                <option value="contacted">Contacted</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed / Won</option>
                <option value="spam">Spam / Archived</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
              style={{
                alignSelf: 'flex-end',
                padding: '12px 20px',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                minHeight: '44px',
                opacity: saving ? 0.7 : 1,
              }}
            >
              <FiSave size={16} /> {saving ? 'Saving...' : 'Save'}
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
