'use client'

import React from 'react'
import {
  FiPhone,
  FiCalendar,
  FiMail,
  FiBarChart2,
  FiEye,
  FiTrash2,
  FiMapPin,
  FiCheck,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

export interface EnquiryData {
  id: string
  customer?: {
    name?: string
    phone?: string
    email?: string
  }
  package?: {
    id?: string
    nameSnapshot?: string
  }
  hotel?: {
    id?: string
    nameSnapshot?: string
  }
  vehicle?: {
    id?: string
    nameSnapshot?: string
    numberPlateSnapshot?: string
  }
  travel?: {
    date?: string
    groupSize?: number
    tripType?: string
  }
  message?: string
  status?: string
  integrations?: {
    emailStatus?: string
    sheetsStatus?: string
    emailError?: string
    sheetsError?: string
    lastSheetSyncAt?: string
    sheetRow?: number
  }
  lastEmailSentAt?: string
  lastEmailSubject?: string
  emailStatus?: string
  emailHistory?: any[]
  notes?: any[]
  timeline?: any[]
  createdAt?: any
}

interface MobileEnquiryCardProps {
  enquiry: EnquiryData
  onViewDetails: (enquiry: EnquiryData) => void
  onChangeStatus: (id: string, newStatus: string) => void
  onArchive: (id: string) => void
  onOpenEmailComposer?: (enquiry: EnquiryData) => void
}

export default function MobileEnquiryCard({
  enquiry,
  onViewDetails,
  onChangeStatus,
  onArchive,
  onOpenEmailComposer,
}: MobileEnquiryCardProps) {
  const status = enquiry.status || 'new'
  const isNew = status === 'new'

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'new':
        return { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.4)', text: '#86EFAC', label: 'New Lead' }
      case 'contacted':
        return { bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 0.4)', text: '#FDE68A', label: 'Contacted' }
      case 'quotation_sent':
        return { bg: 'rgba(139, 92, 246, 0.2)', border: 'rgba(139, 92, 246, 0.4)', text: '#C4B5FD', label: 'Quotation Sent' }
      case 'confirmed':
        return { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 0.4)', text: '#6EE7B7', label: 'Confirmed' }
      case 'payment_pending':
        return { bg: 'rgba(249, 115, 22, 0.2)', border: 'rgba(249, 115, 22, 0.4)', text: '#FDBA74', label: 'Payment Pending' }
      case 'booked':
        return { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.4)', text: '#93C5FD', label: 'Booked' }
      case 'completed':
        return { bg: 'rgba(6, 182, 212, 0.2)', border: 'rgba(6, 182, 212, 0.4)', text: '#67E8F9', label: 'Completed' }
      case 'cancelled':
        return { bg: 'rgba(244, 63, 94, 0.2)', border: 'rgba(244, 63, 94, 0.4)', text: '#FDA4AF', label: 'Cancelled' }
      case 'spam':
        return { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.4)', text: '#FCA5A5', label: 'Spam' }
      case 'in_progress':
        return { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.4)', text: '#93C5FD', label: 'In Progress' }
      case 'closed':
        return { bg: 'rgba(255, 255, 255, 0.1)', border: 'rgba(255, 255, 255, 0.2)', text: '#CBD5E1', label: 'Closed' }
      default:
        return { bg: 'rgba(255, 255, 255, 0.1)', border: 'rgba(255, 255, 255, 0.2)', text: '#ffffff', label: st }
    }
  }

  const badge = getStatusBadge(status)
  const cleanPhone = (enquiry.customer?.phone || '').replace(/[^0-9+]/g, '')
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone}`
    : ''

  return (
    <div
      className="admin-card"
      style={{
        background: isNew
          ? 'var(--admin-brand-bg, rgba(8, 120, 255, 0.08))'
          : 'var(--admin-card, rgba(255, 255, 255, 0.04))',
        border: isNew
          ? '1px solid var(--admin-brand, rgba(8, 120, 255, 0.45))'
          : '1px solid var(--admin-card-border, rgba(255, 255, 255, 0.08))',
        borderRadius: '12px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        position: 'relative',
        boxShadow: 'var(--admin-shadow-sm, none)',
      }}
    >
      {/* Top Bar: ID + Status + Integrations */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.75rem',
            color: 'var(--admin-brand, #0878FF)',
            background: 'var(--admin-brand-bg, rgba(8, 120, 255, 0.12))',
            padding: '2px 8px',
            borderRadius: '4px',
          }}
        >
          {enquiry.id}
        </span>

        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '12px',
            background: badge.bg,
            border: `1px solid ${badge.border}`,
            color: badge.text,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {isNew && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />}
          {badge.label}
        </span>
      </div>

      {/* Customer Information */}
      <div>
        <h4
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--admin-text, #ffffff)',
            margin: '0 0 2px 0',
          }}
        >
          {enquiry.customer?.name || 'Anonymous Guest'}
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
          {enquiry.customer?.phone && (
            <span style={{ fontSize: '0.85rem', color: 'var(--admin-text, rgba(255, 255, 255, 0.85))', fontWeight: 500 }}>
              {enquiry.customer.phone}
            </span>
          )}

          {/* Direct call, WhatsApp, and Email triggers */}
          <div style={{ display: 'inline-flex', gap: '6px' }}>
            {cleanPhone && (
              <>
                <a
                  href={`tel:${cleanPhone}`}
                  aria-label={`Call ${enquiry.customer?.name || 'customer'}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    background: 'var(--admin-brand-bg, rgba(8, 120, 255, 0.15))',
                    color: 'var(--admin-brand, #0878FF)',
                    border: '1px solid var(--admin-brand, rgba(8, 120, 255, 0.4))',
                    textDecoration: 'none',
                  }}
                >
                  <FiPhone size={14} />
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`WhatsApp ${enquiry.customer?.name || 'customer'}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#22C55E',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    textDecoration: 'none',
                  }}
                >
                  <FaWhatsapp size={15} />
                </a>
              </>
            )}

            {onOpenEmailComposer && enquiry.customer?.email && (
              <button
                type="button"
                onClick={() => onOpenEmailComposer(enquiry)}
                aria-label={`Email ${enquiry.customer?.name || 'customer'}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: '#A78BFA',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <FiMail size={14} />
              </button>
            )}
          </div>
        </div>

        {enquiry.customer?.email && (
          <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted, rgba(255, 255, 255, 0.5))', margin: '4px 0 0 0' }}>
            {enquiry.customer.email}
          </p>
        )}
      </div>

      {/* Trip & Package Context */}
      <div
        style={{
          background: 'var(--admin-surface-alt, rgba(0, 0, 0, 0.25))',
          border: '1px solid var(--admin-border, rgba(255, 255, 255, 0.06))',
          padding: '8px 10px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--admin-brand, #0878FF)' }}>
          <FiMapPin size={13} style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {enquiry.package?.nameSnapshot || enquiry.hotel?.nameSnapshot || 'Customised Mountain Tour'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--admin-text-secondary, rgba(255, 255, 255, 0.65))', fontSize: '0.75rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <FiCalendar size={12} /> {enquiry.travel?.date || 'Flexible Date'}
          </span>

          {enquiry.travel?.groupSize !== undefined && (
            <span>{enquiry.travel.groupSize} Guests</span>
          )}

          {enquiry.travel?.tripType && (
            <span style={{ textTransform: 'capitalize' }}>{enquiry.travel.tripType}</span>
          )}
        </div>

        {enquiry.message && (
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--admin-text-muted, rgba(255, 255, 255, 0.5))',
              margin: '2px 0 0 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            &ldquo;{enquiry.message}&rdquo;
          </p>
        )}
      </div>

      {/* Integration Status Chips */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.7rem' }}>
        <span
          style={{
            padding: '2px 6px',
            borderRadius: '4px',
            background: enquiry.integrations?.emailStatus === 'sent'
              ? 'rgba(34, 197, 94, 0.15)'
              : 'rgba(245, 158, 11, 0.15)',
            color: enquiry.integrations?.emailStatus === 'sent' ? '#22C55E' : '#F59E0B',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <FiMail size={11} /> Email: {enquiry.integrations?.emailStatus || 'pending'}
        </span>

        <span
          style={{
            padding: '2px 6px',
            borderRadius: '4px',
            background: enquiry.integrations?.sheetsStatus === 'synced'
              ? 'rgba(34, 197, 94, 0.15)'
              : 'rgba(245, 158, 11, 0.15)',
            color: enquiry.integrations?.sheetsStatus === 'synced' ? '#22C55E' : '#F59E0B',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <FiBarChart2 size={11} /> Sheets: {enquiry.integrations?.sheetsStatus || 'pending'}
        </span>
      </div>

      {/* Actions Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          paddingTop: '0.65rem',
          borderTop: '1px solid var(--admin-border, rgba(255, 255, 255, 0.08))',
          marginTop: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => onViewDetails(enquiry)}
          className="btn-primary"
          style={{
            padding: '8px 14px',
            fontSize: '0.8rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            minHeight: '40px',
          }}
        >
          <FiEye size={14} /> View Details
        </button>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <select
            value={status}
            onChange={(e) => onChangeStatus(enquiry.id, e.target.value)}
            style={{
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid var(--admin-input-border, rgba(255, 255, 255, 0.2))',
              background: 'var(--admin-input-bg, #001040)',
              color: 'var(--admin-input-text, #ffffff)',
              fontSize: '0.75rem',
              minHeight: '40px',
            }}
          >
            <option value="new">New Lead</option>
            <option value="contacted">Contacted</option>
            <option value="quotation_sent">Quotation Sent</option>
            <option value="confirmed">Confirmed</option>
            <option value="payment_pending">Payment Pending</option>
            <option value="booked">Booked</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="spam">Spam</option>
            <option value="in_progress">In Progress (Legacy)</option>
            <option value="closed">Closed (Legacy)</option>
          </select>

          <button
            type="button"
            onClick={() => onArchive(enquiry.id)}
            aria-label="Archive enquiry"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '6px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
