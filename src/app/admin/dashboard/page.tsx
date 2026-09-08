'use client'

import React, { useState, useEffect } from 'react'

export default function AdminDashboardPage() {
  const [token, setToken] = useState('hillstourism-admin-secret')
  const [activeTab, setActiveTab] = useState<'overview' | 'enquiries' | 'hotels' | 'vehicles'>('overview')
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [hotels, setHotels] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Forms
  const [newHotel, setNewHotel] = useState({ name: '', location: '', category: 'Normal', pricePerNight: '₹3,500', amenities: 'Mountain View, Wi-Fi' })
  const [newVehicle, setNewVehicle] = useState({ name: '', numberPlate: '', type: 'SUV', capacity: 7 })

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [enqRes, hotRes, vehRes] = await Promise.all([
        fetch('/api/enquiries', { headers }),
        fetch('/api/admin/hotels', { headers }),
        fetch('/api/admin/vehicles', { headers }),
      ])

      const enqData = await enqRes.json()
      const hotData = await hotRes.json()
      const vehData = await vehRes.json()

      if (enqData.success) setEnquiries(enqData.data || [])
      if (hotData.success) setHotels(hotData.data || [])
      if (vehData.success) setVehicles(vehData.data || [])
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [token])

  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    try {
      const res = await fetch('/api/admin/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...newHotel,
          amenities: newHotel.amenities.split(',').map(s => s.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `Hotel "${newHotel.name}" created successfully!` })
        setNewHotel({ name: '', location: '', category: 'Normal', pricePerNight: '₹3,500', amenities: 'Mountain View, Wi-Fi' })
        fetchAllData()
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Failed to create hotel.' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Network error.' })
    }
  }

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    try {
      const res = await fetch('/api/admin/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newVehicle),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `Vehicle plate "${newVehicle.numberPlate}" added successfully!` })
        setNewVehicle({ name: '', numberPlate: '', type: 'SUV', capacity: 7 })
        fetchAllData()
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Failed to add vehicle.' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Network error.' })
    }
  }

  const handleDeleteHotel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return
    await fetch(`/api/admin/hotels?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchAllData()
  }

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return
    await fetch(`/api/admin/vehicles?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchAllData()
  }

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
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
              }}
            />
            <button
              onClick={fetchAllData}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.75rem' }}
            >
              Refresh
            </button>
            <a
              href="/"
              style={{ color: 'var(--hill-blue-bright)', fontSize: '0.85rem', textDecoration: 'none', marginLeft: '8px' }}
            >
              View Website →
            </a>
          </div>
        </div>

        {/* Alerts */}
        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            background: message.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${message.type === 'success' ? '#22C55E' : '#EF4444'}`,
            color: message.type === 'success' ? '#86EFAC' : '#FCA5A5',
            fontSize: '0.85rem',
          }}>
            {message.type === 'success' ? '✓ ' : '⚠️ '} {message.text}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
          {(['overview', 'enquiries', 'hotels', 'vehicles'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                background: activeTab === tab ? 'var(--hill-blue-bright)' : 'rgba(255,255,255,0.06)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Enquiries</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--hill-blue-bright)', marginTop: '6px' }}>{enquiries.length}</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Leads</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: '#22C55E', marginTop: '6px' }}>
                  {enquiries.filter(e => e.status === 'new').length}
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Curated Hotels</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: '#F59E0B', marginTop: '6px' }}>{hotels.length}</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fleet Vehicles</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: '#A855F7', marginTop: '6px' }}>{vehicles.length}</p>
              </div>
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1rem' }}>Recent Customer Leads</h3>
            <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                    <th style={{ padding: '12px 16px' }}>Enquiry ID</th>
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
                    <tr>
                      <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                        No enquiries captured yet. Submit one through the enquiry form on the website!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ENQUIRIES TAB ── */}
        {activeTab === 'enquiries' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1rem' }}>All Enquiries ({enquiries.length})</h3>
            <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                    <th style={{ padding: '12px 16px' }}>ID</th>
                    <th style={{ padding: '12px 16px' }}>Customer</th>
                    <th style={{ padding: '12px 16px' }}>Phone</th>
                    <th style={{ padding: '12px 16px' }}>Package / Stay</th>
                    <th style={{ padding: '12px 16px' }}>Message</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map(e => (
                    <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--hill-blue-bright)' }}>{e.id}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>{e.customer?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{e.customer?.email}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{e.customer?.phone}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>{e.package?.nameSnapshot || 'None'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{e.hotel?.nameSnapshot}</div>
                      </td>
                      <td style={{ padding: '12px 16px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {e.message || '-'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', fontSize: '0.75rem' }}>
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── HOTELS TAB ── */}
        {activeTab === 'hotels' && (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--hill-blue-bright)' }}>
                Add New Hotel (Server-Enforced Name Uniqueness)
              </h4>
              <form onSubmit={handleCreateHotel} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Hotel Name *"
                  required
                  value={newHotel.name}
                  onChange={e => setNewHotel({ ...newHotel, name: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff' }}
                />
                <input
                  type="text"
                  placeholder="Location (e.g. Munnar, Kerala)"
                  value={newHotel.location}
                  onChange={e => setNewHotel({ ...newHotel, location: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff' }}
                />
                <select
                  value={newHotel.category}
                  onChange={e => setNewHotel({ ...newHotel, category: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: '#001040', color: '#fff' }}
                >
                  <option value="Normal">Normal</option>
                  <option value="Premium">Premium</option>
                  <option value="5 Star">5 Star</option>
                </select>
                <input
                  type="text"
                  placeholder="Price Per Night"
                  value={newHotel.pricePerNight}
                  onChange={e => setNewHotel({ ...newHotel, pricePerNight: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                  Create Hotel
                </button>
              </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {hotels.map(h => (
                <div key={h.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--hill-blue-bright)', fontWeight: 700, textTransform: 'uppercase' }}>{h.category}</span>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, margin: '4px 0' }}>{h.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{h.location}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteHotel(h.id)}
                      style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      Delete
                    </button>
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
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--hill-blue-bright)' }}>
                Add New Fleet Vehicle (Server-Enforced Number Plate Uniqueness)
              </h4>
              <form onSubmit={handleCreateVehicle} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Vehicle Model (e.g. Innova Crysta) *"
                  required
                  value={newVehicle.name}
                  onChange={e => setNewVehicle({ ...newVehicle, name: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff' }}
                />
                <input
                  type="text"
                  placeholder="Number Plate (e.g. TN 01 AB 1234) *"
                  required
                  value={newVehicle.numberPlate}
                  onChange={e => setNewVehicle({ ...newVehicle, numberPlate: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff' }}
                />
                <input
                  type="number"
                  placeholder="Capacity (Seats)"
                  min={1}
                  max={50}
                  value={newVehicle.capacity}
                  onChange={e => setNewVehicle({ ...newVehicle, capacity: parseInt(e.target.value) || 4 })}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                  Register Vehicle
                </button>
              </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {vehicles.map(v => (
                <div key={v.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--hill-blue-bright)', fontWeight: 700 }}>{v.type} · {v.capacity} Seats</span>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, margin: '4px 0' }}>{v.name}</h4>
                      <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#F59E0B' }}>{v.numberPlate}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteVehicle(v.id)}
                      style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
