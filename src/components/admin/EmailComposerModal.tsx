'use client'

import React, { useState, useEffect } from 'react'
import {
  FiX,
  FiMail,
  FiSend,
  FiCheck,
  FiAlertTriangle,
  FiEye,
  FiEdit3,
  FiPaperclip,
  FiInfo,
} from 'react-icons/fi'
import type { EnquiryData } from './MobileEnquiryCard'

export const CRM_TEMPLATES_CONFIG: Record<
  string,
  { name: string; subject: string; message: string }
> = {
  booking_confirmation: {
    name: 'Booking Confirmation',
    subject: 'Booking Confirmed! Your Mountain Journey Awaits [{{enquiry_id}}]',
    message: `Dear {{customer_name}},

We are thrilled to confirm your upcoming mountain journey with Hills Tourism!

Booking Summary:
• Selected Package: {{package}}
• Accommodation: {{hotel}}
• Dedicated Vehicle: {{vehicle}}
• Travel Date: {{travel_date}}
• Guests: {{guests}} Traveler(s)
• Booking Reference: {{enquiry_id}}

What happens next:
Our local mountain concierge will contact you 24 hours prior to departure with your dedicated chauffeur details and a final travel advisory.

If you have any questions or custom requests in the meantime, simply reply to this email or reach us on WhatsApp.

Warm regards,
Hills Tourism Concierge Team`,
  },
  package_details: {
    name: 'Package Details',
    subject: 'Curated Mountain Tour Details & Itinerary — Hills Tourism [{{enquiry_id}}]',
    message: `Dear {{customer_name}},

Thank you for reaching out to Hills Tourism. Here are the curated details for your mountain escape:

Tour Details:
• Package: {{package}}
• Handpicked Stays: {{hotel}}
• Chauffeur-Driven Vehicle: {{vehicle}}
• Proposed Travel Period: {{travel_date}}
• Guests: {{guests}} Traveler(s)

Included in Your Journey:
• Boutique mountain homestays and heritage plantations.
• Experienced hill-terrain chauffeurs.
• Guided sunrise and tea-estate trails.
• Dedicated 24/7 on-ground assistance.

Please review these details and let us know if you would like to customize any days or destinations.

Best regards,
Hills Tourism Travel Team`,
  },
  quotation: {
    name: 'Quotation',
    subject: 'Exclusive Tour Quotation for Your Journey [{{enquiry_id}}]',
    message: `Dear {{customer_name}},

Here is your customized travel quotation for your mountain journey:

Quotation Summary:
• Package: {{package}}
• Stay Category: {{hotel}}
• Vehicle Option: {{vehicle}}
• Travel Date: {{travel_date}}
• Party Size: {{guests}}
• Reference ID: {{enquiry_id}}

Package Inclusions:
All driver allowances, toll charges, hill road permits, parking fees, and curated sightseeing transfers.

This quotation is valid for 7 days. To lock in current peak seasonal pricing and vehicle allocation, please reply to confirm your reservation.

Warm regards,
Hills Tourism Reservations`,
  },
  travel_reminder: {
    name: 'Travel Reminder',
    subject: 'Upcoming Trip Reminder & Mountain Travel Tips [{{enquiry_id}}]',
    message: `Dear {{customer_name}},

Your mountain getaway with Hills Tourism is just around the corner! Here are essential reminders for a safe and comfortable trip:

Reservation Recap:
• Package: {{package}}
• Hotel: {{hotel}}
• Vehicle: {{vehicle}}
• Date of Travel: {{travel_date}}
• Booking ID: {{enquiry_id}}

Essential Mountain Checklist:
1. Warm clothing: Mountain temperatures drop significantly at night.
2. Valid government photo ID for check-in.
3. Motion sickness remedies if sensitive to winding hill roads.
4. Camera and power banks for day-long outdoor excursions.

Your chauffeur will call you prior to departure for pickup coordination.

Safe journeys!
Hills Tourism Mountain Team`,
  },
  custom: {
    name: 'Custom Message',
    subject: 'Update regarding your journey [{{enquiry_id}}] — Hills Tourism',
    message: `Dear {{customer_name}},

Thank you for connecting with Hills Tourism regarding enquiry [{{enquiry_id}}].

We are writing with an update regarding your travel plans:

[Type your message here]

Please let us know how you would like to proceed.

Best regards,
Hills Tourism Team`,
  },
}

interface EmailComposerModalProps {
  enquiry: EnquiryData | null
  isOpen: boolean
  onClose: () => void
  onEmailSent?: (updatedEnquiry: any) => void
}

export default function EmailComposerModal({
  enquiry,
  isOpen,
  onClose,
  onEmailSent,
}: EmailComposerModalProps) {
  const [templateKey, setTemplateKey] = useState<string>('booking_confirmation')
  const [recipient, setRecipient] = useState<string>('')
  const [subject, setSubject] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [previewMode, setPreviewMode] = useState<boolean>(false)
  const [sending, setSending] = useState<boolean>(false)
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const getVariables = (enq: EnquiryData): Record<string, string> => ({
    customer_name: enq.customer?.name || 'Valued Traveler',
    package: enq.package?.nameSnapshot || 'Curated Mountain Journey',
    hotel: enq.hotel?.nameSnapshot || 'Boutique Hill Resort',
    vehicle: enq.vehicle?.numberPlateSnapshot || enq.vehicle?.id || 'Chauffeur-Driven SUV',
    travel_date: enq.travel?.date || 'Flexible',
    guests: enq.travel?.groupSize ? String(enq.travel.groupSize) : '1',
    enquiry_id: enq.id,
  })

  const interpolate = (str: string, vars: Record<string, string>) => {
    let res = str
    for (const [k, v] of Object.entries(vars)) {
      const reg = new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'gi')
      res = res.replace(reg, v || '—')
    }
    return res
  }

  // Load template content when enquiry or template changes
  useEffect(() => {
    if (enquiry && isOpen) {
      setRecipient(enquiry.customer?.email || '')
      const vars = getVariables(enquiry)
      const tpl = CRM_TEMPLATES_CONFIG[templateKey] || CRM_TEMPLATES_CONFIG.custom
      setSubject(interpolate(tpl.subject, vars))
      setMessage(interpolate(tpl.message, vars))
      setAlertMsg(null)
      setPreviewMode(false)
    }
  }, [enquiry, templateKey, isOpen])

  // ESC key dismiss
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !enquiry) return null

  const handleInsertVariable = (varKey: string) => {
    setMessage(prev => `${prev} {{${varKey}}}`)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipient.trim()) {
      setAlertMsg({ type: 'error', text: 'Recipient email address is required.' })
      return
    }
    if (!subject.trim()) {
      setAlertMsg({ type: 'error', text: 'Email subject cannot be empty.' })
      return
    }
    if (!message.trim()) {
      setAlertMsg({ type: 'error', text: 'Message body cannot be empty.' })
      return
    }

    setSending(true)
    setAlertMsg(null)

    try {
      const res = await fetch('/api/admin/crm/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: enquiry.id,
          templateKey,
          subject: subject.trim(),
          message: message.trim(),
          customTo: recipient.trim(),
        }),
      })

      const data = await res.json()
      if (data.success) {
        setAlertMsg({ type: 'success', text: 'Email successfully delivered!' })
        if (onEmailSent) {
          onEmailSent(data.data?.enquiry)
        }
        setTimeout(() => {
          onClose()
        }, 1200)
      } else {
        setAlertMsg({
          type: 'error',
          text: data.error?.message || 'Failed to send email. Please check configuration.',
        })
      }
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err?.message || 'Network error while sending email.' })
    } finally {
      setSending(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid var(--admin-input-border)',
    background: 'var(--admin-input-bg)',
    color: 'var(--admin-input-text)',
    width: '100%',
    fontSize: '0.85rem',
    outline: 'none',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-composer-title"
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
          maxWidth: '680px',
          maxHeight: '90vh',
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
                background: 'rgba(8, 120, 255, 0.15)',
                color: 'var(--hill-blue-bright, #0878FF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiMail size={18} />
            </div>
            <div>
              <h3
                id="email-composer-title"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Customer Email Center
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                Enquiry: <strong style={{ color: 'var(--hill-blue-bright)' }}>{enquiry.id}</strong> ({enquiry.customer?.name})
              </span>
            </div>
          </div>

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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSend} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Alerts */}
          {alertMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: alertMsg.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${alertMsg.type === 'success' ? '#22C55E' : '#EF4444'}`,
                color: alertMsg.type === 'success' ? '#86EFAC' : '#FCA5A5',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {alertMsg.type === 'success' ? <FiCheck size={16} /> : <FiAlertTriangle size={16} />}
              {alertMsg.text}
            </div>
          )}

          {/* Row 1: Template Picker & Recipient */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                Choose Template
              </label>
              <select
                value={templateKey}
                onChange={e => setTemplateKey(e.target.value)}
                style={inputStyle}
              >
                {Object.entries(CRM_TEMPLATES_CONFIG).map(([key, tpl]) => (
                  <option key={key} value={key} style={{ background: 'var(--admin-modal-bg)', color: 'var(--admin-text)' }}>
                    {tpl.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                Recipient (To) *
              </label>
              <input
                type="email"
                required
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                placeholder="customer@example.com"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Row 2: Subject */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
              Email Subject *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Variables Chip Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontWeight: 600 }}>
                Insert Live Variables:
              </span>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--hill-blue-bright)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {previewMode ? <><FiEdit3 size={12} /> Edit Text</> : <><FiEye size={12} /> Live Preview</>}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { label: 'Customer Name', key: 'customer_name' },
                { label: 'Package', key: 'package' },
                { label: 'Hotel', key: 'hotel' },
                { label: 'Vehicle', key: 'vehicle' },
                { label: 'Travel Date', key: 'travel_date' },
                { label: 'Guests', key: 'guests' },
                { label: 'Enquiry ID', key: 'enquiry_id' },
              ].map(v => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => handleInsertVariable(v.key)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    background: 'var(--admin-card, rgba(255,255,255,0.06))',
                    border: '1px solid var(--admin-border)',
                    color: 'var(--admin-text)',
                    cursor: 'pointer',
                  }}
                  title={`Append {{${v.key}}}`}
                >
                  +{v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Message Editor or Preview */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
              Message Body *
            </label>

            {previewMode ? (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: 'var(--admin-card, rgba(255,255,255,0.03))',
                  border: '1px solid var(--admin-border)',
                  minHeight: '220px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {message}
              </div>
            ) : (
              <textarea
                required
                rows={10}
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{
                  ...inputStyle,
                  fontFamily: 'inherit',
                  lineHeight: '1.6',
                  resize: 'vertical',
                  minHeight: '180px',
                }}
              />
            )}
          </div>

          {/* Future-Ready Attachments Note */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'var(--admin-card, rgba(255,255,255,0.02))',
              border: '1px dashed var(--admin-border)',
              fontSize: '0.75rem',
              color: 'var(--admin-text-muted)',
            }}
          >
            <FiPaperclip size={14} />
            <span>Attachments (future-ready): Vouchers and itinerary PDFs will automatically attach upon booking confirmation.</span>
          </div>

          {/* Footer Actions */}
          <div
            className="admin-form-actions"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '0.75rem',
              marginTop: '0.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--admin-border)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn-outline-white"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={sending}
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 24px',
                fontSize: '0.85rem',
                opacity: sending ? 0.7 : 1,
                cursor: sending ? 'not-allowed' : 'pointer',
              }}
            >
              <FiSend size={15} />
              {sending ? 'Sending Email...' : 'Send Email Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
