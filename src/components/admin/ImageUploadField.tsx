'use client'

import React, { useState, useRef } from 'react'
import { FiUploadCloud, FiX, FiCheck, FiRefreshCw, FiImage, FiAlertCircle } from 'react-icons/fi'
import { getOptimizedImageUrl } from '@/lib/cloudinary/transform'

export interface ImageUploadFieldProps {
  label?: string
  value?: string
  onChange: (url: string, publicId?: string) => void
  folder?: string
  token?: string
  placeholder?: string
  altText?: string
  onAltChange?: (alt: string) => void
  helpText?: string
  required?: boolean
}

export default function ImageUploadField({
  label = 'Image',
  value = '',
  onChange,
  folder = 'content',
  token = '',
  placeholder = 'https://res.cloudinary.com/... or upload file',
  altText,
  onAltChange,
  helpText,
  required = false,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return
    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)
      if (altText) formData.append('alt', altText)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to upload image.')
      }

      onChange(json.data.secureUrl, json.data.publicId)
    } catch (err: any) {
      console.error('[ImageUploadField] Upload error:', err)
      setUploadError(err?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
          {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
        </label>
      )}

      {/* Preview box if value exists */}
      {value ? (
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          padding: '10px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          marginBottom: '8px',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '6px',
            overflow: 'hidden',
            background: '#000',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img
              src={getOptimizedImageUrl(value, { width: 128, height: 128, crop: 'fill' })}
              alt={altText || 'Preview'}
              width={64}
              height={64}
              loading="lazy"
              decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                // Fallback indicator
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '0.75rem',
              color: '#fff',
              margin: '0 0 4px 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: 'monospace',
            }}>
              {value}
            </p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--hill-blue-bright)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                }}
              >
                <FiRefreshCw size={11} /> Replace
              </button>
              <button
                type="button"
                onClick={() => onChange('', '')}
                disabled={uploading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#EF4444',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                }}
              >
                <FiX size={11} /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Drag and drop upload zone */
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{
            border: `1.5px dashed ${isDragOver ? 'var(--hill-blue-bright)' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: '8px',
            padding: '14px',
            textAlign: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            background: isDragOver ? 'rgba(56,189,248,0.06)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s ease',
            marginBottom: '8px',
          }}
        >
          {uploading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--hill-blue-bright)', fontSize: '0.8rem' }}>
              <FiRefreshCw className="animate-spin" size={14} /> Uploading to Cloudinary...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <FiUploadCloud size={20} color="var(--hill-blue-bright)" />
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                Click or drag & drop image to upload to Cloudinary
              </p>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                JPEG, PNG, WebP, GIF, AVIF (up to 10MB)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0])
          }
        }}
      />

      {/* Direct URL input fallback */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: '7px 10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
          }}
        />
      </div>

      {onAltChange && (
        <div style={{ marginTop: '6px' }}>
          <input
            type="text"
            value={altText || ''}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder="Alt text / description for accessibility"
            style={{
              width: '100%',
              padding: '6px 10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '0.75rem',
            }}
          />
        </div>
      )}

      {uploadError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '0.7rem', marginTop: '6px' }}>
          <FiAlertCircle size={12} /> {uploadError}
        </div>
      )}

      {helpText && !uploadError && (
        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginTop: '4px' }}>
          {helpText}
        </span>
      )}
    </div>
  )
}
