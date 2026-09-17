'use client'

import React, { useState } from 'react'
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiX,
  FiUser,
  FiClock,
  FiAlertTriangle,
} from 'react-icons/fi'
import type { EnquiryNote } from '@/types/domain'

interface InternalNotesProps {
  enquiryId: string
  notes?: EnquiryNote[]
  onNotesUpdated?: (updatedEnquiry: any) => void
}

export default function InternalNotes({
  enquiryId,
  notes = [],
  onNotesUpdated,
}: InternalNotesProps) {
  const [newContent, setNewContent] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContent.trim()) return

    setAdding(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/crm/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId,
          content: newContent.trim(),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setNewContent('')
        if (onNotesUpdated) {
          onNotesUpdated(data.data.enquiry)
        }
      } else {
        setError(data.error?.message || 'Failed to add note.')
      }
    } catch (err: any) {
      setError(err?.message || 'Network error.')
    } finally {
      setAdding(false)
    }
  }

  const handleStartEdit = (note: EnquiryNote) => {
    setEditingNoteId(note.id)
    setEditingContent(note.content)
  }

  const handleSaveEdit = async (noteId: string) => {
    if (!editingContent.trim()) return
    setSavingEdit(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/crm/notes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId,
          noteId,
          content: editingContent.trim(),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setEditingNoteId(null)
        if (onNotesUpdated) {
          onNotesUpdated(data.data.enquiry)
        }
      } else {
        setError(data.error?.message || 'Failed to update note.')
      }
    } catch (err: any) {
      setError(err?.message || 'Network error.')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this internal note?')) return
    setDeletingNoteId(noteId)
    setError(null)

    try {
      const res = await fetch(`/api/admin/crm/notes?enquiryId=${encodeURIComponent(enquiryId)}&noteId=${encodeURIComponent(noteId)}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        if (onNotesUpdated) {
          onNotesUpdated(data.data.enquiry)
        }
      } else {
        setError(data.error?.message || 'Failed to delete note.')
      }
    } catch (err: any) {
      setError(err?.message || 'Network error.')
    } finally {
      setDeletingNoteId(null)
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
      })
    } catch {
      return ts
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Error Alert */}
      {error && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            color: '#FCA5A5',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <FiAlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Add New Note Box */}
      <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <textarea
          rows={3}
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          placeholder="Add an internal note about customer preferences, budget, or followup instructions..."
          style={{
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid var(--admin-input-border)',
            background: 'var(--admin-input-bg)',
            color: 'var(--admin-input-text)',
            fontSize: '0.85rem',
            lineHeight: '1.5',
            resize: 'vertical',
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={adding || !newContent.trim()}
            className="btn-primary"
            style={{
              padding: '6px 16px',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              opacity: adding || !newContent.trim() ? 0.6 : 1,
              cursor: adding || !newContent.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            <FiPlus size={14} /> {adding ? 'Saving...' : 'Add Note'}
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {notes.length === 0 ? (
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem', margin: '0.5rem 0', fontStyle: 'italic' }}>
            No internal notes added yet. Notes are private and only visible to administrators.
          </p>
        ) : (
          notes.map(note => {
            const isEditing = editingNoteId === note.id

            return (
              <div
                key={note.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'var(--admin-card, rgba(255,255,255,0.03))',
                  border: '1px solid var(--admin-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                {/* Note Meta Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--admin-text)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <FiUser size={12} /> {note.author}
                    </span>
                    <span>&bull;</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <FiClock size={11} /> {formatTimestamp(note.createdAt)}
                    </span>
                    {note.updatedAt && <span style={{ fontStyle: 'italic', fontSize: '0.7rem' }}>(edited)</span>}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!isEditing && (
                      <>
                        <button
                          onClick={() => handleStartEdit(note)}
                          aria-label="Edit note"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--admin-text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            padding: '2px',
                          }}
                        >
                          <FiEdit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          disabled={deletingNoteId === note.id}
                          aria-label="Delete note"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#FCA5A5',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            padding: '2px',
                          }}
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    <textarea
                      rows={3}
                      value={editingContent}
                      onChange={e => setEditingContent(e.target.value)}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid var(--admin-input-border)',
                        background: 'var(--admin-input-bg)',
                        color: 'var(--admin-input-text)',
                        fontSize: '0.85rem',
                        lineHeight: '1.4',
                        outline: 'none',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setEditingNoteId(null)}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          borderRadius: '4px',
                          border: '1px solid var(--admin-border)',
                          background: 'none',
                          color: 'var(--admin-text)',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={savingEdit || !editingContent.trim()}
                        onClick={() => handleSaveEdit(note.id)}
                        className="btn-primary"
                        style={{
                          padding: '4px 12px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        {savingEdit ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--admin-text)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                    {note.content}
                  </p>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
