'use client'

import React from 'react'
import {
  FiClock,
  FiMail,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
  FiRefreshCw,
  FiActivity,
  FiPlusCircle,
  FiUser,
} from 'react-icons/fi'
import type { EnquiryTimelineEvent } from '@/types/domain'

interface EnquiryTimelineProps {
  timeline?: EnquiryTimelineEvent[]
  createdAt?: string | Date
  customerName?: string
}

export default function EnquiryTimeline({
  timeline = [],
  createdAt,
  customerName,
}: EnquiryTimelineProps) {
  // Synthesize initial creation event if timeline is empty
  const events: EnquiryTimelineEvent[] = [...timeline]
  if (events.length === 0 && createdAt) {
    events.push({
      id: 'init-created',
      type: 'created',
      title: 'Enquiry Created',
      description: `Initial submission received from ${customerName || 'customer'}.`,
      timestamp: typeof createdAt === 'string' ? createdAt : createdAt.toISOString(),
      author: 'system',
    })
  }

  // Sort chronological descending (most recent first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'email_sent':
        return { icon: <FiMail size={14} />, bg: 'rgba(34, 197, 94, 0.2)', color: '#22C55E' }
      case 'email_failed':
        return { icon: <FiAlertCircle size={14} />, bg: 'rgba(239, 68, 68, 0.2)', color: '#EF4444' }
      case 'sheets_synced':
        return { icon: <FiCheckCircle size={14} />, bg: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' }
      case 'sheets_failed':
        return { icon: <FiAlertCircle size={14} />, bg: 'rgba(239, 68, 68, 0.2)', color: '#EF4444' }
      case 'status_change':
        return { icon: <FiActivity size={14} />, bg: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' }
      case 'note_added':
        return { icon: <FiFileText size={14} />, bg: 'rgba(168, 85, 247, 0.2)', color: '#A855F7' }
      case 'manual_sync':
        return { icon: <FiRefreshCw size={14} />, bg: 'rgba(8, 120, 255, 0.2)', color: '#0878FF' }
      case 'created':
      default:
        return { icon: <FiPlusCircle size={14} />, bg: 'rgba(14, 165, 233, 0.2)', color: '#0EA5E9' }
    }
  }

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts)
      return d.toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ts
    }
  }

  if (sortedEvents.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
        No timeline events recorded yet.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {sortedEvents.map((evt, idx) => {
        const isLast = idx === sortedEvents.length - 1
        const iconConfig = getEventIcon(evt.type)

        return (
          <div key={evt.id || idx} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
            {/* Timeline Vertical Line & Icon */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '32px' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: iconConfig.bg,
                  color: iconConfig.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  zIndex: 2,
                }}
              >
                {iconConfig.icon}
              </div>

              {!isLast && (
                <div
                  style={{
                    width: '2px',
                    flex: 1,
                    background: 'var(--admin-border)',
                    margin: '4px 0',
                  }}
                />
              )}
            </div>

            {/* Event Content */}
            <div style={{ paddingBottom: isLast ? '0' : '1.25rem', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-text)' }}>
                  {evt.title}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>
                  {formatTimestamp(evt.timestamp)}
                </span>
              </div>

              {evt.description && (
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--admin-text-muted)',
                    margin: '3px 0 0 0',
                    lineHeight: 1.4,
                  }}
                >
                  {evt.description}
                </p>
              )}

              {evt.author && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.7rem', color: 'var(--admin-text-muted)', opacity: 0.8 }}>
                  <FiUser size={11} /> {evt.author}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
