'use client'

import React, { useState, useRef, useEffect } from 'react'
import { trackEnquiryStart, trackEnquirySubmit } from '../lib/analytics/events'
import { FiZap, FiMapPin, FiLock, FiCheckCircle, FiCheck, FiAlertCircle, FiArrowRight } from 'react-icons/fi'

import { packages as defaultPackages } from '../data/packages'
import { stays as defaultHotels } from '../data/stays'
import { vehicles as defaultVehicles } from '../data/vehicles'

const TRIP_TYPES = ['Honeymoon', 'Couple Getaway', 'Family Trip', 'Friends Group', 'Corporate Retreat', 'Solo Journey']

/**
 * @param {object} [props]
 * @param {string} [props.id]
 * @param {string} [props.initialPackageId]
 * @param {string} [props.initialHotelId]
 * @param {string} [props.initialVehicleId]
 * @param {boolean} [props.packageLocked]
 * @param {any[]} [props.initialPackages]
 * @param {any[]} [props.initialHotels]
 * @param {any[]} [props.initialVehicles]
 * @param {string} [props.whatsappNumber]
 */
const Field = ({ id: fid, label, required, error, children }) => (
  <div className={`form-field-wrapper ${error ? 'has-error' : ''}`}>
    <label htmlFor={fid} className="form-label">
      <span>{label}</span>
      {required && <span style={{ color: '#38bdf8', marginLeft: '3px' }}>*</span>}
    </label>
    <div className="form-input-container">
      {children}
    </div>
    {error && (
      <p id={`${fid}-error`} role="alert" className="form-error-msg">
        <FiAlertCircle style={{ fontSize: '0.75rem', flexShrink: 0 }} />
        <span>{error}</span>
      </p>
    )}
  </div>
)

export default function Enquiry({
  id = '',
  initialPackageId = '',
  initialHotelId = '',
  initialVehicleId = '',
  packageLocked = false,
  initialPackages = /** @type {any[]} */ ([]),
  initialHotels = /** @type {any[]} */ ([]),
  initialVehicles = /** @type {any[]} */ ([]),
  whatsappNumber = '',
} = {}) {
  const sectionRef = useRef(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    travelDate: '',
    groupSize: '',
    tripType: '',
    packageId: initialPackageId || '',
    hotelId: initialHotelId || '',
    vehicleId: initialVehicleId || '',
    message: '',
    _hp: '', // Honeypot anti-spam
  })

  const [roomBooking, setRoomBooking] = useState(null)

  // Synchronize when initial props change or room selection event fires
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      packageId: initialPackageId || prev.packageId,
      hotelId: initialHotelId !== undefined && initialHotelId !== '' ? initialHotelId : prev.hotelId,
      vehicleId: initialVehicleId !== undefined && initialVehicleId !== '' ? initialVehicleId : prev.vehicleId,
    }))

    const handleRoomSelection = (evt) => {
      if (!evt.detail) return
      const { hotelId, checkIn, checkOut, nights, roomIds, selectedRooms, estimatedAmount } = evt.detail
      setRoomBooking({ checkIn, checkOut, nights, roomIds, selectedRooms, estimatedAmount })
      
      const totalCapacity = (selectedRooms || []).reduce((acc, r) => acc + (r.capacity || 2), 0)

      setForm(prev => ({
        ...prev,
        hotelId: hotelId || prev.hotelId,
        travelDate: checkIn || prev.travelDate,
        groupSize: totalCapacity > 0 ? String(totalCapacity) : prev.groupSize,
        tripType: prev.tripType || 'Couple Getaway',
        message: prev.message || `Selected Cottages: ${(selectedRooms || []).map(r => r.roomNumber + ' (' + r.name + ')').join(', ')} for ${nights} nights (Est: ₹${(estimatedAmount || 0).toLocaleString()})`
      }))
    }

    window.addEventListener('hillstourism_room_selected', handleRoomSelection)
    return () => window.removeEventListener('hillstourism_room_selected', handleRoomSelection)
  }, [initialPackageId, initialHotelId, initialVehicleId])
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [enquiryRef, setEnquiryRef] = useState('')

  // Catalog data from server props or static fallback (eliminates 3 client-side API requests)
  const catalogPackages = Array.isArray(initialPackages) && initialPackages.length > 0 ? initialPackages : defaultPackages
  const catalogHotels   = Array.isArray(initialHotels) && initialHotels.length > 0 ? initialHotels : defaultHotels
  const catalogVehicles = Array.isArray(initialVehicles) && initialVehicles.length > 0 ? initialVehicles : defaultVehicles

  useEffect(() => {
    const reveals = sectionRef.current?.querySelectorAll('.reveal') || []
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) }
      }),
      { threshold: 0.1 }
    )
    reveals.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
    if (serverError) setServerError('')
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.phone.match(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/)) e.phone = 'Enter a valid phone number'
    if (!form.travelDate) e.travelDate = 'Please select a travel date'
    if (!form.groupSize || isNaN(form.groupSize) || +form.groupSize < 1) e.groupSize = 'Enter group size (min 1)'
    if (!form.tripType) e.tripType = 'Please select a trip type'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setStatus('sending')
    setServerError('')
    trackEnquiryStart('website_enquiry_form')

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          travelDate: form.travelDate,
          groupSize: form.groupSize ? parseInt(form.groupSize) : undefined,
          tripType: form.tripType,
          packageId: form.packageId || undefined,
          hotelId: form.hotelId || undefined,
          vehicleId: form.vehicleId || undefined,
          checkIn: roomBooking?.checkIn || undefined,
          checkOut: roomBooking?.checkOut || undefined,
          nights: roomBooking?.nights || undefined,
          roomIds: roomBooking?.roomIds || undefined,
          message: form.message.trim() || undefined,
          source: roomBooking ? 'stay_details_room_selection' : 'website_enquiry_form',
          _hp: form._hp,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setEnquiryRef(data.data?.enquiryId || 'Received')
        setStatus('success')
        trackEnquirySubmit(true, 'website_enquiry_form')
      } else {
        setStatus('error')
        setServerError(data.error?.message || 'Failed to submit enquiry. Please check your details.')
        trackEnquirySubmit(false, 'website_enquiry_form')
      }
    } catch (err) {
      console.error('[Enquiry Form] Network error:', err)
      setStatus('error')
      setServerError('Network error. Please try again or WhatsApp us directly.')
      trackEnquirySubmit(false, 'website_enquiry_form')
    }
  }

  const whatsappText = encodeURIComponent(
    `Hi! I'd like to plan a trip.\nName: ${form.name}\nPhone: ${form.phone}\nDate: ${form.travelDate}\nGroup: ${form.groupSize} people\nTrip Type: ${form.tripType}\nPackage: ${form.package || 'Not specified'}\n\n${form.message}`
  )

  return (
    <section
      id={id}
      ref={sectionRef}
      aria-label="Trip enquiry form"
      style={{
        position:   'relative',
        overflow:   'hidden',
        background: 'var(--hill-navy-deep)',
        padding:    'clamp(3.5rem,7vw,6.5rem) clamp(1rem,4vw,4rem)',
      }}
    >
      {/* Background mountain image */}
      <div style={{
        position:        'absolute',
        inset:           0,
        backgroundImage: `url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=60&auto=format)`,
        backgroundSize:  'cover',
        backgroundPosition: 'center',
        opacity:         0.07,
        pointerEvents:   'none',
      }} aria-hidden="true" />

      {/* Glow */}
      <div style={{
        position:     'absolute',
        top:          '50%',
        left:         '30%',
        transform:    'translate(-50%,-50%)',
        width:        '600px',
        height:       '400px',
        background:   'radial-gradient(ellipse, rgba(8,120,255,0.1), transparent 70%)',
        pointerEvents: 'none',
      }} aria-hidden="true" />

      <div style={{ maxWidth: 'var(--container-w)', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="enquiry-layout-grid">

          {/* ── Left — Copy ── */}
          <div className="reveal">
            <p className="eyebrow-light" style={{ marginBottom: '1rem' }}>Start Your Journey</p>
            <h2 className="heading-xl" style={{ color: '#ffffff', marginBottom: '1.25rem' }}>
              Your mountain<br />story starts here.
            </h2>
            <div className="divider-blue" style={{ marginBottom: '1.5rem' }} />
            <p className="body-lg" style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '400px', marginBottom: '2.5rem', lineHeight: 1.75 }}>
              Tell us about your dream trip. Our team will get back to you within 2 hours with a personalised itinerary.
            </p>

            {/* Trust signals */}
            {[
              { icon: <FiZap />, text: '2-hour response guarantee' },
              { icon: <FiMapPin />, text: 'Expert local trip planners' },
              { icon: <FiLock />, text: 'Zero booking fees' },
              { icon: <FiCheckCircle />, text: 'Fully customisable itineraries' },
            ].map(item => (
              <div key={item.text} style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '0.75rem',
                marginBottom: '0.85rem',
              }}>
                <span style={{
                  fontSize:   '1rem',
                  flexShrink: 0,
                  width:      '32px',
                  height:     '32px',
                  display:    'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(8,120,255,0.15)',
                  borderRadius: '8px',
                }}>
                  {item.icon}
                </span>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)' }}>
                  {item.text}
                </p>
              </div>
            ))}

            {/* WhatsApp direct */}
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '') || '919999000000'}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-white"
              style={{ marginTop: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              aria-label="Contact Hillstourism on WhatsApp"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Us Directly
            </a>
          </div>

          {/* ── Right — Form ── */}
          <div className="reveal" style={{ transitionDelay: '0.1s' }}>
            <div style={{
              background:   'rgba(255,255,255,0.04)',
              border:       '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding:      'clamp(1.5rem,4vw,2.5rem)',
              backdropFilter: 'blur(12px)',
            }}>
              {status === 'success' ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#22C55E' }}><FiCheck /></div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                    Enquiry Sent!
                  </h3>
                  {enquiryRef && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--hill-blue-bright)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                      REF: {enquiryRef}
                    </p>
                  )}
                  <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
                    Thank you, {form.name}! Our team will review your mountain escape and reach you within 2 hours with a personalized plan.
                  </p>
                  <button
                    className="btn-primary"
                    style={{ marginTop: '2rem' }}
                    onClick={() => {
                      setStatus('idle')
                      setForm({ name:'', phone:'', email:'', travelDate:'', groupSize:'', tripType:'', packageId:'', hotelId:'', vehicleId:'', message:'', _hp:'' })
                    }}
                  >
                    Send Another Enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate aria-label="Trip enquiry">
                  {/* Anti-spam honeypot (invisible to humans) */}
                  <div style={{ display: 'none' }} aria-hidden="true">
                    <input
                      type="text"
                      name="_hp"
                      value={form._hp}
                      onChange={e => update('_hp', e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {serverError && (
                    <div style={{
                      padding: '0.75rem 1rem',
                      background: 'rgba(239,68,68,0.12)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '8px',
                      color: '#FCA5A5',
                      fontSize: '0.8rem',
                      marginBottom: '1.25rem',
                    }}>
                      <FiAlertCircle style={{ marginRight: 6, display: 'inline' }} /> {serverError}
                    </div>
                  )}

                  <div className="enquiry-inputs-grid">
                    <Field id="name" label="Full Name" required error={errors.name}>
                      <input id="name" type="text" value={form.name} onChange={e => update('name', e.target.value)}
                        placeholder="Rahul Mehta" className="form-input" required aria-required="true"
                        aria-invalid={errors.name ? 'true' : 'false'}
                        aria-describedby={errors.name ? 'name-error' : undefined} />
                    </Field>
                    <Field id="phone" label="Phone / WhatsApp" required error={errors.phone}>
                      <input id="phone" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                        placeholder="+91 9999 000000" className="form-input" required aria-required="true"
                        aria-invalid={errors.phone ? 'true' : 'false'}
                        aria-describedby={errors.phone ? 'phone-error' : undefined} />
                    </Field>
                    <Field id="email" label="Email Address">
                      <input id="email" type="email" value={form.email} onChange={e => update('email', e.target.value)}
                        placeholder="rahul@example.com" className="form-input" />
                    </Field>
                    <Field id="travelDate" label="Travel Date" required error={errors.travelDate}>
                      <input id="travelDate" type="date" value={form.travelDate} onChange={e => update('travelDate', e.target.value)}
                        className="form-input" required aria-required="true"
                        aria-invalid={errors.travelDate ? 'true' : 'false'}
                        aria-describedby={errors.travelDate ? 'travelDate-error' : undefined}
                        min={new Date().toISOString().split('T')[0]} />
                    </Field>
                    <Field id="groupSize" label="Group Size" required error={errors.groupSize}>
                      <input id="groupSize" type="number" value={form.groupSize} onChange={e => update('groupSize', e.target.value)}
                        placeholder="2" min="1" max="50" className="form-input" required aria-required="true"
                        aria-invalid={errors.groupSize ? 'true' : 'false'}
                        aria-describedby={errors.groupSize ? 'groupSize-error' : undefined} />
                    </Field>
                    <Field id="tripType" label="Trip Type" required error={errors.tripType}>
                      <select id="tripType" value={form.tripType} onChange={e => update('tripType', e.target.value)}
                        className="form-input" required aria-required="true"
                        aria-invalid={errors.tripType ? 'true' : 'false'}
                        aria-describedby={errors.tripType ? 'tripType-error' : undefined}>
                        <option value="">Select type…</option>
                        {TRIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>
                    <Field id="packageId" label="Preferred Package">
                      <select id="packageId" value={form.packageId} onChange={e => update('packageId', e.target.value)}
                        className="form-input" disabled={packageLocked}>
                        <option value="">Any / Not sure</option>
                        {catalogPackages.map(p => <option key={p.id} value={p.id}>{p.name || p.title}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="enquiry-inputs-grid">
                    <Field id="hotelId" label="Preferred Stay">
                      <select id="hotelId" value={form.hotelId} onChange={e => update('hotelId', e.target.value)}
                        className="form-input">
                        <option value="">Any / Not sure</option>
                        {catalogHotels.map(h => <option key={h.id} value={h.id}>{h.name}{h.location ? ` — ${h.location}` : ''}</option>)}
                      </select>
                    </Field>
                    <Field id="vehicleId" label="Preferred Vehicle">
                      <select id="vehicleId" value={form.vehicleId} onChange={e => update('vehicleId', e.target.value)}
                        className="form-input">
                        <option value="">Any / Not sure</option>
                        {catalogVehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.type} · {v.capacity} seats)</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field id="message" label="Message / Additional Requirements">
                    <textarea id="message" value={form.message} onChange={e => update('message', e.target.value)}
                      placeholder="Tell us more about your dream trip — places to visit, special requests, dietary needs…"
                      rows={4} className="form-input" style={{ resize: 'vertical' }} />
                  </Field>

                  <div className="enquiry-submit-wrapper">
                    <button
                      type="submit"
                      className="btn-primary enquiry-submit-btn"
                      disabled={status === 'sending'}
                      aria-label="Send trip enquiry"
                    >
                      {status === 'sending' ? (
                        <>
                          <span style={{ display:'inline-block', width:'16px', height:'16px', borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', animation:'spin 0.7s linear infinite', marginRight:'8px' }} />
                          Sending Enquiry…
                        </>
                      ) : (
                        <>Send Enquiry <FiArrowRight style={{ marginLeft: '6px' }} /></>
                      )}
                    </button>
                  </div>

                  <p style={{ textAlign:'center', fontSize:'0.7rem', color:'rgba(255,255,255,0.35)', marginTop:'1rem' }}>
                    No spam. We'll only use this to plan your trip.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .enquiry-layout-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: clamp(2rem, 5vw, 6rem);
          align-items: start;
        }

        .enquiry-inputs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .form-field-wrapper {
          display: flex;
          flex-direction: column;
        }

        .form-error-msg {
          font-size: 0.72rem;
          color: #EF4444;
          margin-top: 0.35rem;
          font-family: var(--font-body);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .enquiry-submit-wrapper {
          margin-top: 1.5rem;
        }

        .enquiry-submit-btn {
          width: 100%;
          justify-content: center;
          padding: 0.95rem 1.5rem;
          font-size: 0.92rem;
          border-radius: 10px;
          min-height: 48px;
        }

        @media (max-width: 992px) {
          .enquiry-layout-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
        }

        @media (max-width: 640px) {
          .enquiry-inputs-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .enquiry-submit-wrapper {
            position: sticky;
            bottom: 0.75rem;
            z-index: 20;
            padding: 0.5rem 0;
            background: linear-gradient(to top, rgba(0, 9, 31, 0.95) 75%, transparent);
            padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </section>
  )
}
