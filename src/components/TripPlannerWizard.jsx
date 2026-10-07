'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getOptimizedImageUrl } from '../lib/cloudinary/transform'
import { FiArrowRight, FiCheckCircle, FiClock, FiMapPin, FiRefreshCcw } from 'react-icons/fi'

const VIBES = [
  { id: 'honeymoon', label: 'Romantic & Honeymoon', icon: '❤️' },
  { id: 'family', label: 'Family Friendly', icon: '👨‍👩‍👧‍👦' },
  { id: 'friends', label: 'Adventure with Friends', icon: '🏕️' },
  { id: 'peaceful', label: 'Quiet & Peaceful', icon: '🍃' },
]

const DURATIONS = [
  { id: 'short', label: '1 - 2 Days', desc: 'Quick weekend escape' },
  { id: 'medium', label: '3 - 4 Days', desc: 'The perfect balance' },
  { id: 'long', label: '5+ Days', desc: 'Complete exploration' },
]

export default function TripPlannerWizard({ packages = [] }) {
  const [step, setStep] = useState(1)
  const [vibe, setVibe] = useState('')
  const [duration, setDuration] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState([])

  const handleNext = () => {
    if (step === 1 && vibe) setStep(2)
    else if (step === 2 && duration) {
      setStep(3)
      setIsAnalyzing(true)
      
      // Simulate an AI analyzing delay for a premium feel
      setTimeout(() => {
        analyzeTrips()
        setIsAnalyzing(false)
        setStep(4)
      }, 2000)
    }
  }

  const analyzeTrips = () => {
    // Simple heuristic to filter packages based on vibe and duration
    let filtered = [...packages]

    // Filter by vibe
    if (vibe === 'honeymoon') {
      filtered = filtered.filter(p => (p.category || '').toLowerCase().includes('honeymoon') || (p.tag || '').toLowerCase().includes('couple'))
    } else if (vibe === 'family') {
      filtered = filtered.filter(p => (p.category || '').toLowerCase().includes('family'))
    } else if (vibe === 'friends') {
      filtered = filtered.filter(p => (p.category || '').toLowerCase().includes('friends') || (p.description || '').toLowerCase().includes('trek'))
    } else if (vibe === 'peaceful') {
      filtered = filtered.filter(p => (p.description || '').toLowerCase().includes('quiet') || (p.description || '').toLowerCase().includes('peace'))
    }

    // Filter by duration loosely
    if (duration === 'short') {
      filtered = filtered.filter(p => (p.nights || 0) <= 2)
    } else if (duration === 'medium') {
      filtered = filtered.filter(p => (p.nights || 0) >= 2 && (p.nights || 0) <= 4)
    } else if (duration === 'long') {
      filtered = filtered.filter(p => (p.nights || 0) > 4)
    }

    // Fallback if too strict
    if (filtered.length === 0) {
      filtered = packages.slice(0, 3) // suggest top 3 instead
    }

    setResults(filtered.slice(0, 6)) // max 6 results
  }

  const reset = () => {
    setStep(1)
    setVibe('')
    setDuration('')
    setResults([])
  }

  return (
    <div className="planner-container">
      <div className="planner-card">
        {step < 3 && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
        )}

        {/* STEP 1: Vibe */}
        {step === 1 && (
          <div className="step-content fade-in">
            <h2 className="heading-lg" style={{ color: 'var(--hill-navy)', marginBottom: '0.5rem' }}>What kind of trip are you looking for?</h2>
            <p className="body-md" style={{ color: 'var(--hill-muted)', marginBottom: '2rem' }}>Help us understand your travel style.</p>
            
            <div className="grid-options">
              {VIBES.map(v => (
                <button
                  key={v.id}
                  className={`option-btn ${vibe === v.id ? 'selected' : ''}`}
                  onClick={() => setVibe(v.id)}
                >
                  <span className="icon">{v.icon}</span>
                  <span className="label">{v.label}</span>
                </button>
              ))}
            </div>
            
            <div className="action-row">
              <button className="btn-primary" onClick={handleNext} disabled={!vibe}>
                Continue <FiArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Duration */}
        {step === 2 && (
          <div className="step-content fade-in">
            <button className="back-btn" onClick={() => setStep(1)}>← Back</button>
            <h2 className="heading-lg" style={{ color: 'var(--hill-navy)', marginBottom: '0.5rem' }}>How long is your trip?</h2>
            <p className="body-md" style={{ color: 'var(--hill-muted)', marginBottom: '2rem' }}>We'll find the perfect itinerary for your schedule.</p>
            
            <div className="grid-options stack">
              {DURATIONS.map(d => (
                <button
                  key={d.id}
                  className={`option-btn ${duration === d.id ? 'selected' : ''}`}
                  onClick={() => setDuration(d.id)}
                >
                  <div style={{ textAlign: 'left' }}>
                    <span className="label" style={{ display: 'block', fontSize: '1.1rem' }}>{d.label}</span>
                    <span className="desc" style={{ fontSize: '0.8rem', color: 'var(--hill-muted)' }}>{d.desc}</span>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="action-row">
              <button className="btn-primary" onClick={handleNext} disabled={!duration}>
                Find My Trip <FiArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Analyzing */}
        {step === 3 && (
          <div className="step-content text-center fade-in" style={{ padding: '4rem 2rem' }}>
            <div className="spinner"></div>
            <h3 className="heading-md" style={{ color: 'var(--hill-navy)', marginTop: '1.5rem' }}>Curating your perfect escape...</h3>
            <p style={{ color: 'var(--hill-muted)', marginTop: '0.5rem' }}>Searching through our handcrafted itineraries.</p>
          </div>
        )}

        {/* STEP 4: Results */}
        {step === 4 && (
          <div className="step-content fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 className="heading-lg" style={{ color: 'var(--hill-navy)' }}>Your Recommended Trips</h2>
                <p className="body-md" style={{ color: 'var(--hill-muted)' }}>Based on your preferences, here are our top picks.</p>
              </div>
              <button className="btn-outline" onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiRefreshCcw /> Start Over
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {results.map(pkg => (
                <article key={pkg.id} className="package-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <Link href={`/packages/${pkg.slug || pkg.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                    <div className="package-card-img" style={{ height: '200px' }}>
                      <img
                        src={getOptimizedImageUrl(pkg.image, { width: 400, crop: 'fill' })}
                        alt={pkg.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute', bottom: '0.5rem', right: '0.5rem',
                        background: 'rgba(0,0,0,0.7)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem'
                      }}>
                        <FiClock style={{ display: 'inline', marginRight: '4px' }}/>{pkg.duration}
                      </div>
                    </div>
                  </Link>
                  <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 className="heading-sm" style={{ marginBottom: '0.3rem', fontSize: '1.1rem' }}>
                      <Link href={`/packages/${pkg.slug || pkg.id}`} style={{ color: 'var(--hill-navy)', textDecoration: 'none' }}>
                        {pkg.name || pkg.title}
                      </Link>
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--hill-blue-bright)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiMapPin /> {pkg.destination}
                    </p>
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--hill-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--hill-navy)' }}>{pkg.price}</span>
                      <Link href={`/packages/${pkg.slug || pkg.id}`} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                        View
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .planner-container {
          padding: 4rem 1rem;
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--hill-surface);
        }
        .planner-card {
          background: white;
          border-radius: 16px;
          padding: 3rem;
          width: 100%;
          max-width: ${step === 4 ? '1100px' : '700px'};
          box-shadow: 0 10px 40px rgba(0,0,0,0.05);
          position: relative;
          overflow: hidden;
          transition: max-width 0.4s ease;
        }
        .progress-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: var(--hill-border);
        }
        .progress-fill {
          height: 100%;
          background: var(--hill-blue);
          transition: width 0.4s ease;
        }
        .fade-in {
          animation: fadeIn 0.4s ease forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .grid-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .grid-options.stack {
          grid-template-columns: 1fr;
        }
        .option-btn {
          background: var(--hill-surface);
          border: 2px solid transparent;
          padding: 1.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .option-btn:hover {
          background: var(--hill-white);
          border-color: rgba(67, 107, 194, 0.2);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .option-btn.selected {
          border-color: var(--hill-blue);
          background: rgba(67, 107, 194, 0.05);
        }
        .option-btn .icon {
          font-size: 2rem;
        }
        .option-btn .label {
          font-family: var(--font-display);
          font-weight: 600;
          color: var(--hill-navy);
        }
        .action-row {
          margin-top: 2.5rem;
          display: flex;
          justify-content: flex-end;
        }
        .back-btn {
          background: none;
          border: none;
          color: var(--hill-muted);
          cursor: pointer;
          font-weight: 500;
          margin-bottom: 1rem;
          padding: 0;
        }
        .back-btn:hover {
          color: var(--hill-navy);
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(67, 107, 194, 0.2);
          border-top-color: var(--hill-blue);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .planner-card { padding: 2rem 1.5rem; }
          .grid-options { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
