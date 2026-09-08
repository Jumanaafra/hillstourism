'use client'

import React, { useState, useEffect } from 'react'
import type { Package, ItineraryDay } from '@/types/domain'

type Tab = 'overview' | 'enquiries' | 'packages' | 'hotels' | 'vehicles' | 'content' | 'knowledge' | 'settings'

export default function AdminDashboardPage() {
  const [token, setToken] = useState('hillstourism-admin-secret')
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [hotels, setHotels] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [knowledge, setKnowledge] = useState<any[]>([])
  const [contentData, setContentData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Filter state for enquiries
  const [enqSearch, setEnqSearch] = useState('')
  const [enqStatusFilter, setEnqStatusFilter] = useState('')

  // Package editor state
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)

  // Forms
  const [newHotel, setNewHotel] = useState({ name: '', location: '', category: 'Normal', pricePerNight: '₹3,500', amenities: 'Mountain View, Wi-Fi' })
  const [newVehicle, setNewVehicle] = useState({ name: '', numberPlate: '', type: 'SUV', capacity: 7 })
  const [newKnowledge, setNewKnowledge] = useState({ title: '', content: '', category: 'general', keywords: '' })

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [enqRes, hotRes, vehRes, pkgRes] = await Promise.all([
        fetch('/api/enquiries', { headers }).then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/hotels', { headers }).then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/vehicles', { headers }).then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/packages', { headers }).then(r => r.json()).catch(() => ({ success: false })),
      ])

      if (enqRes.success) setEnquiries(enqRes.data || [])
      if (hotRes.success) setHotels(hotRes.data || [])
      if (vehRes.success) setVehicles(vehRes.data || [])
      if (pkgRes.success) setPackages(pkgRes.data || [])
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/content', { headers })
      const data = await res.json()
      if (data.success) setContentData(data.data)
    } catch (err) {
      console.error('Failed to load content:', err)
    }
  }

  const fetchKnowledge = async () => {
    try {
      const res = await fetch('/api/admin/chat-knowledge', { headers })
      const data = await res.json()
      if (data.success) setKnowledge(data.data || [])
    } catch (err) {
      console.error('Failed to load knowledge:', err)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [token])

  useEffect(() => {
    if (activeTab === 'content') fetchContent()
    if (activeTab === 'knowledge') fetchKnowledge()
    if (activeTab === 'settings') fetchContent()
  }, [activeTab])

  // ── Handlers ──

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/hotels', {
        method: 'POST', headers,
        body: JSON.stringify({ ...newHotel, amenities: newHotel.amenities.split(',').map(s => s.trim()).filter(Boolean) }),
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `Hotel "${newHotel.name}" created!`)
        setNewHotel({ name: '', location: '', category: 'Normal', pricePerNight: '₹3,500', amenities: 'Mountain View, Wi-Fi' })
        fetchAllData()
      } else {
        showMsg('error', data.error?.message || 'Failed to create hotel.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/vehicles', {
        method: 'POST', headers,
        body: JSON.stringify(newVehicle),
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `Vehicle "${newVehicle.numberPlate}" added!`)
        setNewVehicle({ name: '', numberPlate: '', type: 'SUV', capacity: 7 })
        fetchAllData()
      } else {
        showMsg('error', data.error?.message || 'Failed to add vehicle.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleCreateKnowledge = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/chat-knowledge', {
        method: 'POST', headers,
        body: JSON.stringify(newKnowledge),
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `Knowledge "${newKnowledge.title}" created!`)
        setNewKnowledge({ title: '', content: '', category: 'general', keywords: '' })
        fetchKnowledge()
      } else {
        showMsg('error', data.error?.message || 'Failed to create knowledge.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleDeleteHotel = async (id: string) => {
    if (!confirm('Delete this hotel?')) return
    await fetch(`/api/admin/hotels?id=${id}`, { method: 'DELETE', headers })
    fetchAllData()
  }

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Delete this vehicle?')) return
    await fetch(`/api/admin/vehicles?id=${id}`, { method: 'DELETE', headers })
    fetchAllData()
  }

  const handleChangeEnquiryStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/enquiries', {
        method: 'PATCH', headers,
        body: JSON.stringify({ id, status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `Enquiry ${id} status → ${newStatus}`)
        fetchAllData()
      } else {
        showMsg('error', data.error?.message || 'Failed to update status.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleArchiveEnquiry = async (id: string) => {
    if (!confirm('Archive this enquiry?')) return
    try {
      await fetch(`/api/enquiries?id=${id}`, { method: 'DELETE', headers })
      showMsg('success', `Enquiry ${id} archived.`)
      fetchAllData()
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contentData?.settings) return
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PATCH', headers,
        body: JSON.stringify({ type: 'settings', ...contentData.settings }),
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', 'Settings updated!')
      } else {
        showMsg('error', data.error?.message || 'Failed to update settings.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  // ── Package & Itinerary Handlers ──

  const handleStartCreatePackage = () => {
    setEditingPackage({
      id: '',
      name: '',
      slug: '',
      destination: '',
      category: 'Couple',
      duration: '3 Days / 2 Nights',
      nights: 2,
      price: '₹9,999',
      priceNote: 'per person',
      tag: 'Curated Route',
      shortDescription: '',
      description: '',
      highlights: ['Tea Garden Walk', 'Mountain Viewpoint', 'Campfire'],
      itinerary: [
        {
          day: 1,
          title: 'Arrival & Scenic Exploration',
          description: 'Scenic ascent through the mountain highway, check-in to hillside resort, and evening local market stroll.',
          locations: ['Arrival Base', 'Mountain Hub'],
          activities: ['Scenic mountain drive', 'Resort check-in', 'Sunset viewpoint'],
          meals: ['Dinner'],
          accommodation: 'Boutique Mountain Resort',
          travelInfo: 'Private AC transfer',
        },
      ],
      inclusions: ['2 Nights stay in boutique mountain resort', 'Daily breakfast & dinner', 'Dedicated private vehicle for all transfers & sightseeing'],
      exclusions: ['Airfare / train tickets', 'Lunches and personal shopping expenses'],
      importantInformation: ['Valid government photo ID required for all travelers', 'Carry warm clothing for evening chill'],
      hotelIds: [],
      vehicleIds: [],
      active: true,
    })
  }

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPackage) return

    if (!editingPackage.name.trim()) {
      showMsg('error', 'Package name is required.')
      return
    }
    if (!editingPackage.destination.trim()) {
      showMsg('error', 'Package destination is required.')
      return
    }

    if (editingPackage.itinerary && editingPackage.itinerary.length > 0) {
      const seenDays = new Set<number>()
      for (const day of editingPackage.itinerary) {
        const dayNum = Number(day.day)
        if (isNaN(dayNum) || !Number.isInteger(dayNum) || dayNum < 1) {
          showMsg('error', `Day number "${day.day}" is invalid. Must be an integer >= 1.`)
          return
        }
        if (seenDays.has(dayNum)) {
          showMsg('error', `Duplicate day number detected: Day ${dayNum}. Each day must have a unique number.`)
          return
        }
        seenDays.add(dayNum)
        if (!day.title.trim()) {
          showMsg('error', `Day ${dayNum} must have a title.`)
          return
        }
        if (!day.description.trim()) {
          showMsg('error', `Day ${dayNum} must have a description.`)
          return
        }
      }
    }

    try {
      const isCreate = !editingPackage.id
      const url = '/api/admin/packages'
      const method = isCreate ? 'POST' : 'PATCH'

      const payload = {
        ...editingPackage,
        slug: editingPackage.slug?.trim() || editingPackage.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `Package "${editingPackage.name}" saved successfully!`)
        setEditingPackage(null)
        fetchAllData()
      } else {
        showMsg('error', data.error?.message || 'Failed to save package.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return
    try {
      const res = await fetch(`/api/admin/packages?id=${id}`, { method: 'DELETE', headers })
      const data = await res.json()
      if (data.success) {
        showMsg('success', 'Package deleted.')
        if (editingPackage?.id === id) setEditingPackage(null)
        fetchAllData()
      } else {
        showMsg('error', data.error?.message || 'Failed to delete package.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const addItineraryDay = () => {
    if (!editingPackage) return
    const currentItinerary = editingPackage.itinerary || []
    const maxDay = currentItinerary.length > 0 ? Math.max(...currentItinerary.map(d => Number(d.day) || 0)) : 0
    const newDay: ItineraryDay = {
      day: maxDay + 1,
      title: `Day ${maxDay + 1} Highland Journey`,
      description: '',
      locations: [],
      activities: [],
      meals: [],
      accommodation: '',
      travelInfo: '',
      images: [],
    }
    setEditingPackage({
      ...editingPackage,
      itinerary: [...currentItinerary, newDay],
    })
  }

  const updateItineraryDay = (index: number, field: keyof ItineraryDay, value: any) => {
    if (!editingPackage || !editingPackage.itinerary) return
    const updated = [...editingPackage.itinerary]
    updated[index] = { ...updated[index], [field]: value }
    setEditingPackage({ ...editingPackage, itinerary: updated })
  }

  const removeItineraryDay = (index: number) => {
    if (!editingPackage || !editingPackage.itinerary) return
    const updated = editingPackage.itinerary.filter((_, i) => i !== index)
    setEditingPackage({ ...editingPackage, itinerary: updated })
  }

  const reorderItineraryDay = (index: number, direction: 'up' | 'down') => {
    if (!editingPackage || !editingPackage.itinerary) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= editingPackage.itinerary.length) return

    const updated = [...editingPackage.itinerary]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    // Re-assign sequential day numbers to preserve natural ascending order
    const renumbered = updated.map((d, i) => ({ ...d, day: i + 1 }))
    setEditingPackage({ ...editingPackage, itinerary: renumbered })
  }

  const duplicateItineraryDay = (index: number) => {
    if (!editingPackage || !editingPackage.itinerary) return
    const source = editingPackage.itinerary[index]
    const maxDay = Math.max(...editingPackage.itinerary.map(d => Number(d.day) || 0))
    const duplicated: ItineraryDay = {
      ...source,
      day: maxDay + 1,
      title: `${source.title} (Copy)`,
      locations: source.locations ? [...source.locations] : [],
      activities: source.activities ? [...source.activities] : [],
      meals: source.meals ? [...source.meals] : [],
      images: source.images ? [...source.images] : [],
    }
    setEditingPackage({
      ...editingPackage,
      itinerary: [...editingPackage.itinerary, duplicated],
    })
  }

  // Filtered enquiries
  const filteredEnquiries = enquiries.filter(e => {
    if (enqStatusFilter && e.status !== enqStatusFilter) return false
    if (enqSearch) {
      const q = enqSearch.toLowerCase()
      return (
        e.customer?.name?.toLowerCase().includes(q) ||
        e.customer?.phone?.includes(q) ||
        e.customer?.email?.toLowerCase().includes(q) ||
        e.id?.toLowerCase().includes(q)
      )
    }
    return true
  })

  // ── Shared Styles ──
  const cardStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }
  const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', width: '100%' }
  const statStyle: React.CSSProperties = { ...cardStyle }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'enquiries', label: 'Enquiries' },
    { key: 'packages', label: 'Packages' },
    { key: 'hotels', label: 'Hotels' },
    { key: 'vehicles', label: 'Vehicles' },
    { key: 'content', label: 'Content' },
    { key: 'knowledge', label: 'Chat Knowledge' },
    { key: 'settings', label: 'Settings' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--hill-navy-deep)', color: '#ffffff', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700 }}>
              Hills Tourism — Operations Dashboard
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: '4px' }}>
              Enquiry management, unique inventory, and live lead monitoring
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Admin Token:</span>
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              style={{ ...inputStyle, width: '180px' }}
            />
            <button onClick={fetchAllData} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
              Refresh
            </button>
            <a href="/" style={{ color: 'var(--hill-blue-bright)', fontSize: '0.85rem', textDecoration: 'none', marginLeft: '8px' }}>
              View Website →
            </a>
          </div>
        </div>

        {/* Alerts */}
        {message && (
          <div style={{
            padding: '12px 16px', borderRadius: '8px', marginBottom: '1.5rem',
            background: message.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${message.type === 'success' ? '#22C55E' : '#EF4444'}`,
            color: message.type === 'success' ? '#86EFAC' : '#FCA5A5', fontSize: '0.85rem',
          }}>
            {message.type === 'success' ? '✓ ' : '⚠️ '} {message.text}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 16px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                background: activeTab === tab.key ? 'var(--hill-blue-bright)' : 'rgba(255,255,255,0.06)',
                color: '#ffffff', border: 'none', cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <div style={statStyle}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Enquiries</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--hill-blue-bright)', marginTop: '6px' }}>{enquiries.length}</p>
              </div>
              <div style={statStyle}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Leads</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: '#22C55E', marginTop: '6px' }}>
                  {enquiries.filter(e => e.status === 'new').length}
                </p>
              </div>
              <div style={statStyle}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active Packages</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: '#F59E0B', marginTop: '6px' }}>{packages.filter(p => p.active).length}</p>
              </div>
              <div style={statStyle}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hotels / Vehicles</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: '#A855F7', marginTop: '6px' }}>{hotels.length} / {vehicles.length}</p>
              </div>
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1rem' }}>Recent Customer Leads</h3>
            <div style={{ overflowX: 'auto', ...cardStyle }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                    <th style={{ padding: '12px 16px' }}>ID</th>
                    <th style={{ padding: '12px 16px' }}>Customer</th>
                    <th style={{ padding: '12px 16px' }}>Phone</th>
                    <th style={{ padding: '12px 16px' }}>Travel Date</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Email</th>
                    <th style={{ padding: '12px 16px' }}>Sheets</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.slice(0, 5).map(e => (
                    <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--hill-blue-bright)' }}>{e.id}</td>
                      <td style={{ padding: '12px 16px' }}>{e.customer?.name}</td>
                      <td style={{ padding: '12px 16px' }}>{e.customer?.phone}</td>
                      <td style={{ padding: '12px 16px' }}>{e.travel?.date || 'Flexible'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: e.status === 'new' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)', color: e.status === 'new' ? '#86EFAC' : '#fff', fontSize: '0.75rem' }}>
                          {e.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: e.integrations?.emailStatus === 'sent' ? '#86EFAC' : '#FCA5A5' }}>
                        {e.integrations?.emailStatus || 'pending'}
                      </td>
                      <td style={{ padding: '12px 16px', color: e.integrations?.sheetsStatus === 'synced' ? '#86EFAC' : '#FCA5A5' }}>
                        {e.integrations?.sheetsStatus || 'pending'}
                      </td>
                    </tr>
                  ))}
                  {enquiries.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No enquiries yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ENQUIRIES TAB ── */}
        {activeTab === 'enquiries' && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Enquiries ({filteredEnquiries.length})</h3>
              <input
                type="text" placeholder="Search name, phone, email..."
                value={enqSearch} onChange={e => setEnqSearch(e.target.value)}
                style={{ ...inputStyle, width: '250px' }}
              />
              <select value={enqStatusFilter} onChange={e => setEnqStatusFilter(e.target.value)}
                style={{ ...inputStyle, width: '150px', background: '#001040' }}>
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
                <option value="spam">Spam</option>
              </select>
            </div>
            <div style={{ overflowX: 'auto', ...cardStyle }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                    <th style={{ padding: '10px 12px' }}>ID</th>
                    <th style={{ padding: '10px 12px' }}>Customer</th>
                    <th style={{ padding: '10px 12px' }}>Phone</th>
                    <th style={{ padding: '10px 12px' }}>Package / Hotel</th>
                    <th style={{ padding: '10px 12px' }}>Message</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                    <th style={{ padding: '10px 12px' }}>Integrations</th>
                    <th style={{ padding: '10px 12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnquiries.map(e => (
                    <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--hill-blue-bright)', fontSize: '0.7rem' }}>{e.id}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div>{e.customer?.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{e.customer?.email}</div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>{e.customer?.phone}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div>{e.package?.nameSnapshot || '—'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{e.hotel?.nameSnapshot || ''} {e.vehicle?.numberPlateSnapshot ? `· ${e.vehicle.numberPlateSnapshot}` : ''}</div>
                      </td>
                      <td style={{ padding: '10px 12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {e.message || '—'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <select
                          value={e.status}
                          onChange={ev => handleChangeEnquiryStatus(e.id, ev.target.value)}
                          style={{ ...inputStyle, width: '110px', fontSize: '0.7rem', padding: '4px 8px', background: '#001040' }}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="in_progress">In Progress</option>
                          <option value="closed">Closed</option>
                          <option value="spam">Spam</option>
                        </select>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.7rem' }}>
                        <span style={{ color: e.integrations?.emailStatus === 'sent' ? '#86EFAC' : '#FCA5A5' }}>
                          📧{e.integrations?.emailStatus || '?'}
                        </span>{' '}
                        <span style={{ color: e.integrations?.sheetsStatus === 'synced' ? '#86EFAC' : '#FCA5A5' }}>
                          📊{e.integrations?.sheetsStatus || '?'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <button onClick={() => handleArchiveEnquiry(e.id)}
                          style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.7rem' }}>
                          Archive
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PACKAGES TAB ── */}
        {activeTab === 'packages' && (
          <div>
            {editingPackage ? (
              /* ── PACKAGE & ITINERARY EDITOR ── */
              <div style={{ ...cardStyle, marginBottom: '2rem', border: '1px solid var(--hill-blue-bright)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--hill-blue-bright)', fontWeight: 700, textTransform: 'uppercase' }}>Package Management</span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700, marginTop: '2px' }}>
                      {editingPackage.id ? `Edit Package: ${editingPackage.name}` : 'Create New Journey Package'}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setEditingPackage(null)}
                      style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePackage}
                      className="btn-primary"
                      style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                    >
                      Save Package & Itinerary
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSavePackage} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* 1. Basic Information */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '1rem' }}>
                      1. Basic Information
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Package Name *</label>
                        <input
                          type="text"
                          required
                          value={editingPackage.name}
                          onChange={e => setEditingPackage({ ...editingPackage, name: e.target.value })}
                          style={inputStyle}
                          placeholder="e.g. Munnar Escape"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Slug (URL identifier)</label>
                        <input
                          type="text"
                          value={editingPackage.slug || ''}
                          onChange={e => setEditingPackage({ ...editingPackage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') })}
                          style={inputStyle}
                          placeholder="e.g. munnar-escape"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Destination *</label>
                        <input
                          type="text"
                          required
                          value={editingPackage.destination}
                          onChange={e => setEditingPackage({ ...editingPackage, destination: e.target.value })}
                          style={inputStyle}
                          placeholder="e.g. Munnar, Kerala"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Category</label>
                        <select
                          value={editingPackage.category || 'Couple'}
                          onChange={e => setEditingPackage({ ...editingPackage, category: e.target.value })}
                          style={{ ...inputStyle, background: '#001040' }}
                        >
                          <option value="Couple">Couple</option>
                          <option value="Family">Family</option>
                          <option value="Friends">Friends</option>
                          <option value="Honeymoon">Honeymoon</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Duration Display</label>
                        <input
                          type="text"
                          value={editingPackage.duration || ''}
                          onChange={e => setEditingPackage({ ...editingPackage, duration: e.target.value })}
                          style={inputStyle}
                          placeholder="e.g. 3 Days / 2 Nights"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Number of Nights</label>
                        <input
                          type="number"
                          min="0"
                          value={editingPackage.nights !== undefined ? editingPackage.nights : ''}
                          onChange={e => setEditingPackage({ ...editingPackage, nights: e.target.value ? parseInt(e.target.value) : undefined })}
                          style={inputStyle}
                          placeholder="e.g. 2"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Price Display</label>
                        <input
                          type="text"
                          value={editingPackage.price || ''}
                          onChange={e => setEditingPackage({ ...editingPackage, price: e.target.value })}
                          style={inputStyle}
                          placeholder="e.g. ₹9,999"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Price Note</label>
                        <input
                          type="text"
                          value={editingPackage.priceNote || ''}
                          onChange={e => setEditingPackage({ ...editingPackage, priceNote: e.target.value })}
                          style={inputStyle}
                          placeholder="e.g. per person"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Experience Style Tag</label>
                        <input
                          type="text"
                          value={editingPackage.tag || ''}
                          onChange={e => setEditingPackage({ ...editingPackage, tag: e.target.value })}
                          style={inputStyle}
                          placeholder="e.g. Most Popular, Nature Immersion"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Cover Image URL</label>
                        <input
                          type="text"
                          value={editingPackage.coverImage || editingPackage.image || ''}
                          onChange={e => setEditingPackage({ ...editingPackage, coverImage: e.target.value, image: e.target.value })}
                          style={inputStyle}
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '1.25rem' }}>
                        <input
                          type="checkbox"
                          id="pkgActive"
                          checked={editingPackage.active !== false}
                          onChange={e => setEditingPackage({ ...editingPackage, active: e.target.checked })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="pkgActive" style={{ fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                          Publicly Active (Visible on site)
                        </label>
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Short Description (Hero & Cards)</label>
                        <textarea
                          rows={2}
                          value={editingPackage.shortDescription || ''}
                          onChange={e => setEditingPackage({ ...editingPackage, shortDescription: e.target.value })}
                          style={{ ...inputStyle, resize: 'vertical' }}
                          placeholder="One or two compelling sentences about this package..."
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Full Narrative Description</label>
                        <textarea
                          rows={2}
                          value={editingPackage.description || ''}
                          onChange={e => setEditingPackage({ ...editingPackage, description: e.target.value })}
                          style={{ ...inputStyle, resize: 'vertical' }}
                          placeholder="Detailed overview of the journey..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Highlights */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.5rem' }}>
                      2. Highlights (Comma-Separated)
                    </h4>
                    <input
                      type="text"
                      value={(editingPackage.highlights || []).join(', ')}
                      onChange={e => setEditingPackage({
                        ...editingPackage,
                        highlights: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                      })}
                      style={inputStyle}
                      placeholder="Tea Garden Walk, Sunset Viewpoint, Campfire, Jeep Ride"
                    />
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {(editingPackage.highlights || []).map((h, i) => (
                        <span key={i} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(8, 120, 255, 0.2)', color: 'var(--hill-blue-bright)' }}>
                          ✨ {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 3. Day-Wise Itinerary (The Core Feature) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                          3. Day-Wise Itinerary ({(editingPackage.itinerary || []).length} Days)
                        </h4>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                          Add, edit, duplicate, and reorder days. Day numbers must be positive and unique.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addItineraryDay}
                        style={{ padding: '6px 14px', borderRadius: '6px', background: 'var(--hill-blue)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        + Add Day
                      </button>
                    </div>

                    {(editingPackage.itinerary || []).length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>No itinerary days added yet.</p>
                        <button type="button" onClick={addItineraryDay} className="btn-primary" style={{ marginTop: '0.75rem', padding: '6px 14px', fontSize: '0.75rem' }}>
                          + Add First Day
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {(editingPackage.itinerary || []).map((dayItem, index) => (
                          <div
                            key={index}
                            style={{
                              background: 'rgba(0,0,0,0.35)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '10px',
                              padding: '1.25rem',
                            }}
                          >
                            {/* Day Header Controls */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--hill-blue-bright)', fontWeight: 700 }}>Day:</span>
                                <input
                                  type="number"
                                  min="1"
                                  required
                                  value={dayItem.day}
                                  onChange={e => updateItineraryDay(index, 'day', parseInt(e.target.value) || 1)}
                                  style={{ ...inputStyle, width: '65px', padding: '4px 8px', fontSize: '0.85rem' }}
                                />
                                <input
                                  type="text"
                                  required
                                  placeholder="Day Title *"
                                  value={dayItem.title}
                                  onChange={e => updateItineraryDay(index, 'title', e.target.value)}
                                  style={{ ...inputStyle, width: 'clamp(200px, 30vw, 360px)', padding: '4px 8px', fontSize: '0.85rem', fontWeight: 600 }}
                                />
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => reorderItineraryDay(index, 'up')}
                                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: index === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)', color: index === 0 ? 'rgba(255,255,255,0.3)' : '#fff', cursor: index === 0 ? 'not-allowed' : 'pointer', fontSize: '0.75rem' }}
                                  title="Move Day Up"
                                >
                                  ↑ Up
                                </button>
                                <button
                                  type="button"
                                  disabled={index === (editingPackage.itinerary?.length || 1) - 1}
                                  onClick={() => reorderItineraryDay(index, 'down')}
                                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: index === (editingPackage.itinerary?.length || 1) - 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)', color: index === (editingPackage.itinerary?.length || 1) - 1 ? 'rgba(255,255,255,0.3)' : '#fff', cursor: index === (editingPackage.itinerary?.length || 1) - 1 ? 'not-allowed' : 'pointer', fontSize: '0.75rem' }}
                                  title="Move Day Down"
                                >
                                  ↓ Down
                                </button>
                                <button
                                  type="button"
                                  onClick={() => duplicateItineraryDay(index)}
                                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: '0.75rem' }}
                                  title="Duplicate Day"
                                >
                                  Duplicate
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeItineraryDay(index)}
                                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', cursor: 'pointer', fontSize: '0.75rem' }}
                                  title="Delete Day"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            {/* Day Description */}
                            <div style={{ marginBottom: '0.75rem' }}>
                              <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '2px' }}>Day Description *</label>
                              <textarea
                                rows={2}
                                required
                                value={dayItem.description}
                                onChange={e => updateItineraryDay(index, 'description', e.target.value)}
                                style={{ ...inputStyle, resize: 'vertical', fontSize: '0.85rem' }}
                                placeholder="Narrative description of this day's exploration..."
                              />
                            </div>

                            {/* Route, Activities, Meals, Stay, Travel, Images */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                              <div>
                                <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '2px' }}>Locations / Route (comma-separated)</label>
                                <input
                                  type="text"
                                  value={(dayItem.locations || []).join(', ')}
                                  onChange={e => updateItineraryDay(index, 'locations', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                  style={{ ...inputStyle, fontSize: '0.8rem' }}
                                  placeholder="e.g. Munnar, Mattupetty, Top Station"
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '2px' }}>Activities (comma-separated)</label>
                                <input
                                  type="text"
                                  value={(dayItem.activities || []).join(', ')}
                                  onChange={e => updateItineraryDay(index, 'activities', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                  style={{ ...inputStyle, fontSize: '0.8rem' }}
                                  placeholder="e.g. Scenic drive, Safari, Boating"
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '2px' }}>Meals (comma-separated)</label>
                                <input
                                  type="text"
                                  value={(dayItem.meals || []).join(', ')}
                                  onChange={e => updateItineraryDay(index, 'meals', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                  style={{ ...inputStyle, fontSize: '0.8rem' }}
                                  placeholder="e.g. Breakfast, Dinner"
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '2px' }}>Accommodation / Stay</label>
                                <input
                                  type="text"
                                  value={dayItem.accommodation || ''}
                                  onChange={e => updateItineraryDay(index, 'accommodation', e.target.value)}
                                  style={{ ...inputStyle, fontSize: '0.8rem' }}
                                  placeholder="e.g. Mountain Resort"
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '2px' }}>Travel Information</label>
                                <input
                                  type="text"
                                  value={dayItem.travelInfo || ''}
                                  onChange={e => updateItineraryDay(index, 'travelInfo', e.target.value)}
                                  style={{ ...inputStyle, fontSize: '0.8rem' }}
                                  placeholder="e.g. Private AC transfer (~120 km)"
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '2px' }}>Day Image URLs (comma-separated)</label>
                                <input
                                  type="text"
                                  value={(dayItem.images || []).join(', ')}
                                  onChange={e => updateItineraryDay(index, 'images', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                  style={{ ...inputStyle, fontSize: '0.8rem' }}
                                  placeholder="https://..."
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4 & 5. Inclusions & Exclusions */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: '#86EFAC', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.5rem' }}>
                        4. Inclusions (One per line)
                      </h4>
                      <textarea
                        rows={4}
                        value={(editingPackage.inclusions || []).join('\n')}
                        onChange={e => setEditingPackage({
                          ...editingPackage,
                          inclusions: e.target.value.split('\n').map(s => s.trim()).filter(Boolean),
                        })}
                        style={{ ...inputStyle, resize: 'vertical', fontSize: '0.85rem' }}
                        placeholder="2 Nights accommodation in boutique stay&#10;Daily breakfast and dinner&#10;Private sanitized cab with chauffeur"
                      />
                    </div>

                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: '#FCA5A5', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.5rem' }}>
                        5. Exclusions (One per line)
                      </h4>
                      <textarea
                        rows={4}
                        value={(editingPackage.exclusions || []).join('\n')}
                        onChange={e => setEditingPackage({
                          ...editingPackage,
                          exclusions: e.target.value.split('\n').map(s => s.trim()).filter(Boolean),
                        })}
                        style={{ ...inputStyle, resize: 'vertical', fontSize: '0.85rem' }}
                        placeholder="Airfare / train tickets&#10;Lunches and personal expenses&#10;Optional adventure activities"
                      />
                    </div>
                  </div>

                  {/* 6. Important Information */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: '#FDE68A', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.5rem' }}>
                      6. Important Information & Guidelines (One per line)
                    </h4>
                    <textarea
                      rows={3}
                      value={(editingPackage.importantInformation || []).join('\n')}
                      onChange={e => setEditingPackage({
                        ...editingPackage,
                        importantInformation: e.target.value.split('\n').map(s => s.trim()).filter(Boolean),
                      })}
                      style={{ ...inputStyle, resize: 'vertical', fontSize: '0.85rem' }}
                      placeholder="Valid government photo ID required for all guests&#10;Carry warm clothing for evening temperatures"
                    />
                  </div>

                  {/* 7. Connected Inventory (Stays & Fleet Vehicles) */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.75rem' }}>
                      7. Connected Hotels & Vehicles (Enquiry Options)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                      {/* Hotels checkboxes */}
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '8px' }}>
                          Select Available Stays:
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                          {hotels.map(h => {
                            const isChecked = (editingPackage.hotelIds || []).includes(h.id)
                            return (
                              <label key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={e => {
                                    const current = editingPackage.hotelIds || []
                                    const next = e.target.checked
                                      ? [...current, h.id]
                                      : current.filter(id => id !== h.id)
                                    setEditingPackage({ ...editingPackage, hotelIds: next })
                                  }}
                                />
                                <span>{h.name} <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>({h.location || h.category})</span></span>
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      {/* Vehicles checkboxes */}
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '8px' }}>
                          Select Available Fleet Vehicles:
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                          {vehicles.map(v => {
                            const isChecked = (editingPackage.vehicleIds || []).includes(v.id)
                            return (
                              <label key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={e => {
                                    const current = editingPackage.vehicleIds || []
                                    const next = e.target.checked
                                      ? [...current, v.id]
                                      : current.filter(id => id !== v.id)
                                    setEditingPackage({ ...editingPackage, vehicleIds: next })
                                  }}
                                />
                                <span>{v.name} <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>({v.type} · {v.capacity} seats)</span></span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 8. SEO Settings */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.75rem' }}>
                      8. SEO & Social Metadata
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Meta Title</label>
                        <input
                          type="text"
                          value={editingPackage.seo?.title || ''}
                          onChange={e => setEditingPackage({
                            ...editingPackage,
                            seo: { ...editingPackage.seo, title: e.target.value },
                          })}
                          style={inputStyle}
                          placeholder="e.g. Munnar Escape 3 Days Trip | Hills Tourism"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Meta Description</label>
                        <input
                          type="text"
                          value={editingPackage.seo?.description || ''}
                          onChange={e => setEditingPackage({
                            ...editingPackage,
                            seo: { ...editingPackage.seo, description: e.target.value },
                          })}
                          style={inputStyle}
                          placeholder="Explore our curated 3-day Munnar itinerary..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save / Cancel Footer */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem' }}>
                    <button
                      type="button"
                      onClick={() => setEditingPackage(null)}
                      style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ padding: '8px 24px', fontSize: '0.85rem' }}
                    >
                      Save Package & Itinerary
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {/* ── PACKAGES CATALOG LIST ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>
                  Curated Packages ({packages.length})
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                  Manage public itineraries, day schedules, and connected stays & vehicles
                </p>
              </div>
              <button
                onClick={handleStartCreatePackage}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                + Create New Package
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {packages.map(p => (
                <div key={p.id} style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--hill-blue-bright)', fontWeight: 700, textTransform: 'uppercase' }}>
                        {p.destination} · {p.duration}
                      </span>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, margin: '4px 0' }}>
                        {p.name || (p as any).title}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                        {p.category || p.tag} {p.nights !== undefined ? `· ${p.nights} Nights` : ''}
                      </p>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: p.active !== false ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: p.active !== false ? '#86EFAC' : '#FCA5A5', fontSize: '0.65rem' }}>
                      {p.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Itinerary indicator */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '0.5rem 0', fontSize: '0.75rem' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(8, 120, 255, 0.15)', color: 'var(--hill-blue-bright)' }}>
                      📅 {p.itinerary?.length || 0} Itinerary Days
                    </span>
                    {p.inclusions && p.inclusions.length > 0 && (
                      <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#86EFAC' }}>
                        ✓ {p.inclusions.length} Inclusions
                      </span>
                    )}
                  </div>

                  {p.price && (
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F59E0B', marginTop: 'auto', paddingTop: '0.75rem' }}>
                      {p.price} <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>{p.priceNote}</span>
                    </p>
                  )}

                  {/* Card Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button
                      onClick={() => setEditingPackage(JSON.parse(JSON.stringify(p)))}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    >
                      Edit Itinerary & Details
                    </button>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <a
                        href={`/packages/${p.slug || p.id}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.75rem', color: 'var(--hill-blue-bright)', textDecoration: 'none' }}
                      >
                        View ↗
                      </a>
                      <button
                        onClick={() => handleDeletePackage(p.id)}
                        style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HOTELS TAB ── */}
        {activeTab === 'hotels' && (
          <div>
            <div style={{ ...cardStyle, marginBottom: '2rem' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--hill-blue-bright)' }}>
                Add New Hotel (Server-Enforced Name Uniqueness)
              </h4>
              <form onSubmit={handleCreateHotel} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <input type="text" placeholder="Hotel Name *" required value={newHotel.name} onChange={e => setNewHotel({ ...newHotel, name: e.target.value })} style={inputStyle} />
                <input type="text" placeholder="Location (e.g. Munnar, Kerala)" value={newHotel.location} onChange={e => setNewHotel({ ...newHotel, location: e.target.value })} style={inputStyle} />
                <select value={newHotel.category} onChange={e => setNewHotel({ ...newHotel, category: e.target.value })} style={{ ...inputStyle, background: '#001040' }}>
                  <option value="Normal">Normal</option>
                  <option value="Premium">Premium</option>
                  <option value="5 Star">5 Star</option>
                </select>
                <input type="text" placeholder="Price Per Night" value={newHotel.pricePerNight} onChange={e => setNewHotel({ ...newHotel, pricePerNight: e.target.value })} style={inputStyle} />
                <button type="submit" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>Create Hotel</button>
              </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {hotels.map(h => (
                <div key={h.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--hill-blue-bright)', fontWeight: 700, textTransform: 'uppercase' }}>{h.category}</span>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, margin: '4px 0' }}>{h.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{h.location}</p>
                    </div>
                    <button onClick={() => handleDeleteHotel(h.id)} style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                  </div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '10px' }}>{h.pricePerNight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── VEHICLES TAB ── */}
        {activeTab === 'vehicles' && (
          <div>
            <div style={{ ...cardStyle, marginBottom: '2rem' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--hill-blue-bright)' }}>
                Add New Fleet Vehicle (Server-Enforced Number Plate Uniqueness)
              </h4>
              <form onSubmit={handleCreateVehicle} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <input type="text" placeholder="Vehicle Model *" required value={newVehicle.name} onChange={e => setNewVehicle({ ...newVehicle, name: e.target.value })} style={inputStyle} />
                <input type="text" placeholder="Number Plate (e.g. TN 01 AB 1234) *" required value={newVehicle.numberPlate} onChange={e => setNewVehicle({ ...newVehicle, numberPlate: e.target.value })} style={inputStyle} />
                <input type="number" placeholder="Capacity (Seats)" min={1} max={50} value={newVehicle.capacity} onChange={e => setNewVehicle({ ...newVehicle, capacity: parseInt(e.target.value) || 4 })} style={inputStyle} />
                <button type="submit" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>Register Vehicle</button>
              </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {vehicles.map(v => (
                <div key={v.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--hill-blue-bright)', fontWeight: 700 }}>{v.type} · {v.capacity} Seats</span>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, margin: '4px 0' }}>{v.name}</h4>
                      <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#F59E0B' }}>{v.numberPlate}</p>
                    </div>
                    <button onClick={() => handleDeleteVehicle(v.id)} style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CONTENT TAB ── */}
        {activeTab === 'content' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1rem' }}>Content Management</h3>
            {contentData ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={cardStyle}>
                  <h4 style={{ color: 'var(--hill-blue-bright)', marginBottom: '0.5rem' }}>Categories ({contentData.categories?.length || 0})</h4>
                  {contentData.categories?.map((c: any) => (
                    <div key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                      {c.title} <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>({c.badge || c.slug})</span>
                    </div>
                  ))}
                </div>
                <div style={cardStyle}>
                  <h4 style={{ color: 'var(--hill-blue-bright)', marginBottom: '0.5rem' }}>Testimonials ({contentData.testimonials?.length || 0})</h4>
                  {contentData.testimonials?.map((t: any) => (
                    <div key={t.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                      {t.name} — {t.trip} <span style={{ color: '#F59E0B' }}>{'★'.repeat(t.rating)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ ...cardStyle, gridColumn: 'span 2' }}>
                  <h4 style={{ color: 'var(--hill-blue-bright)', marginBottom: '0.5rem' }}>Experiences ({contentData.experiences?.length || 0})</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                    {contentData.experiences?.map((e: any) => (
                      <div key={e.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.85rem' }}>
                        <strong>{e.title}</strong>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{e.location} · {e.duration} · {e.difficulty}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading content...</p>
            )}
          </div>
        )}

        {/* ── CHAT KNOWLEDGE TAB ── */}
        {activeTab === 'knowledge' && (
          <div>
            <div style={{ ...cardStyle, marginBottom: '2rem' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--hill-blue-bright)' }}>
                Add Chat Knowledge
              </h4>
              <form onSubmit={handleCreateKnowledge} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <input type="text" placeholder="Title *" required value={newKnowledge.title} onChange={e => setNewKnowledge({ ...newKnowledge, title: e.target.value })} style={inputStyle} />
                <select value={newKnowledge.category} onChange={e => setNewKnowledge({ ...newKnowledge, category: e.target.value })} style={{ ...inputStyle, background: '#001040' }}>
                  <option value="general">General</option>
                  <option value="company">Company</option>
                  <option value="package">Package</option>
                  <option value="hotel">Hotel</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="policy">Policy</option>
                  <option value="faq">FAQ</option>
                </select>
                <input type="text" placeholder="Keywords (comma-separated)" value={newKnowledge.keywords} onChange={e => setNewKnowledge({ ...newKnowledge, keywords: e.target.value })} style={inputStyle} />
                <div style={{ gridColumn: '1 / -1' }}>
                  <textarea placeholder="Knowledge content *" required value={newKnowledge.content} onChange={e => setNewKnowledge({ ...newKnowledge, content: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>Add Knowledge</button>
              </form>
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1rem' }}>Knowledge Base ({knowledge.length})</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {knowledge.map(k => (
                <div key={k.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--hill-blue-bright)', fontWeight: 700, textTransform: 'uppercase' }}>{k.category}</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '4px 0' }}>{k.title}</h4>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: k.active ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: k.active ? '#86EFAC' : '#FCA5A5', fontSize: '0.65rem' }}>
                      {k.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '8px', lineHeight: 1.5 }}>{k.content}</p>
                  {k.keywords?.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {k.keywords.map((kw: string) => (
                        <span key={kw} style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>{kw}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1rem' }}>Site Settings</h3>
            {contentData?.settings ? (
              <form onSubmit={handleUpdateSettings} style={cardStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  {Object.entries(contentData.settings).map(([key, val]) => (
                    <div key={key}>
                      <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="text"
                        value={String(val)}
                        onChange={e => setContentData({
                          ...contentData,
                          settings: { ...contentData.settings, [key]: e.target.value },
                        })}
                        style={inputStyle}
                      />
                    </div>
                  ))}
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.85rem' }}>Save Settings</button>
              </form>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading settings...</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
