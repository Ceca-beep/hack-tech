import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { getIdentityStatus, getMyFlights } from '../api/client'
import FaceEnroll from '../components/Identity/FaceEnroll'
import DocumentForm from '../components/Identity/DocumentForm'
import BottomNav from '../components/BottomNav'

export default function IdentityPage() {
  const navigate = useNavigate()
  const { biometricId, documentId, verificationToken } = useStore()
  const [showEnroll, setShowEnroll] = useState(false)
  const [showDocForm, setShowDocForm] = useState(false)
  const [flight, setFlight] = useState(null)

  useEffect(() => {
    getMyFlights()
      .then(({ data }) => { if (data?.length) setFlight(data[0]) })
      .catch(() => {
        // Use demo flight data
        setFlight(DEMO_FLIGHT)
      })
  }, [])

  const faceEnrolled = !!biometricId
  const hasDocument = !!documentId

  // Demo flight for display
  const displayFlight = flight || DEMO_FLIGHT

  return (
    <div className="min-h-full bg-[#0b1120] pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <svg className="w-4.5 h-4.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
        <h1 className="text-lg font-bold text-white">Digital Ally</h1>
        <button className="relative text-slate-400 hover:text-white p-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </div>

      {/* Current Ticket Section */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">Current Ticket</h2>
          <button className="text-xs text-blue-400 font-medium">Next Flight</button>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl overflow-hidden">
          {/* Flight Header */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">SkyGuide Flight</p>
                <p className="text-xl font-bold text-white">{displayFlight.flight_number}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Gate</p>
                <p className="text-xl font-bold text-blue-400">{displayFlight.gate || 'B24'}</p>
              </div>
            </div>

            {/* Route */}
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{displayFlight.origin_code || 'LHR'}</p>
                <p className="text-xs text-slate-500">{displayFlight.origin_city || 'London'}</p>
              </div>
              <div className="flex-1 px-4 flex items-center">
                <div className="flex-1 h-px bg-slate-600" />
                <svg className="w-5 h-5 text-slate-500 mx-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
                <div className="flex-1 h-px bg-slate-600" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{displayFlight.destination_code || 'JFK'}</p>
                <p className="text-xs text-slate-500">{displayFlight.destination_city || 'New York'}</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-1">
            <div className="border-t border-dashed border-slate-700" />
            <div className="absolute -left-3 -top-3 w-6 h-6 bg-[#0b1120] rounded-full" />
            <div className="absolute -right-3 -top-3 w-6 h-6 bg-[#0b1120] rounded-full" />
          </div>

          {/* Details Row */}
          <div className="px-4 py-3 flex items-center gap-4">
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Boarding Time</p>
                  <p className="text-sm font-bold text-white">10:45 AM</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Terminal</p>
                  <p className="text-sm font-bold text-white">T5</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Seat</p>
                  <p className="text-sm font-bold text-blue-400">12A</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Zone</p>
                  <p className="text-sm font-bold text-white">2</p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex-shrink-0 w-20 h-20 bg-white rounded-lg p-1.5 flex items-center justify-center">
              <QRPattern />
            </div>
          </div>
        </div>
      </div>

      {/* Biometric Status */}
      <div className="px-5 mb-5">
        <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3">Biometric Status</h2>
        <button
          onClick={() => !faceEnrolled && setShowEnroll(true)}
          className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-colors ${
            faceEnrolled
              ? 'bg-green-500/5 border-green-500/20'
              : 'bg-slate-800/50 border-slate-700/30 hover:bg-slate-800'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            faceEnrolled ? 'bg-green-500/15' : 'bg-slate-700'
          }`}>
            <svg className={`w-6 h-6 ${faceEnrolled ? 'text-green-400' : 'text-slate-400'}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white">
                {faceEnrolled ? 'Face Enrolled' : 'Enroll Face'}
              </p>
              {faceEnrolled && (
                <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {faceEnrolled ? 'Active for seamless boarding' : 'Tap to start face enrollment'}
            </p>
          </div>
        </button>
      </div>

      {/* Verified Documents */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">Verified Documents</h2>
          <button className="text-xs text-blue-400 font-medium">Manage All</button>
        </div>

        <div className="space-y-2">
          {/* Passport */}
          <button
            onClick={() => !hasDocument && setShowDocForm(true)}
            className="w-full flex items-center gap-3 p-3.5 bg-slate-800/50 border border-slate-700/30 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-white">Passport (International)</p>
              <p className="text-xs text-slate-500">Expires: 12 Nov 2028</p>
            </div>
            {hasDocument ? (
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md bg-green-500/20 text-green-400">
                Verified
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400">
                Add
              </span>
            )}
          </button>

          {/* E-Visa */}
          <div className="flex items-center gap-3 p-3.5 bg-slate-800/50 border border-slate-700/30 rounded-xl">
            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">E-Visa (United States)</p>
              <p className="text-xs text-slate-500">Destination Requirement</p>
            </div>
            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md bg-red-500/20 text-red-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01" />
              </svg>
              Required
            </span>
          </div>
        </div>
      </div>

      {/* Terminal Kiosk Mode */}
      <div className="px-5 mb-6">
        <button className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border border-blue-500/20 rounded-2xl hover:from-blue-600/15 hover:to-cyan-600/15 transition-colors">
          <div className="w-12 h-12 bg-blue-500/15 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-blue-400">Terminal Kiosk Mode</p>
            <p className="text-xs text-slate-500">Sync with check-in counters</p>
          </div>
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Face Enrollment Modal */}
      {showEnroll && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowEnroll(false)} />
          <div className="relative bg-slate-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Face Enrollment</h3>
              <button onClick={() => setShowEnroll(false)} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <FaceEnroll onComplete={() => setShowEnroll(false)} />
          </div>
        </div>
      )}

      {/* Document Form Modal */}
      {showDocForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowDocForm(false)} />
          <div className="relative bg-slate-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 border border-slate-700 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Travel Document</h3>
              <button onClick={() => setShowDocForm(false)} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <DocumentForm onComplete={() => setShowDocForm(false)} />
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

function QRPattern() {
  // Simple QR-like pattern for visual effect
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <rect width="64" height="64" fill="white" />
      {/* Corner markers */}
      <rect x="2" y="2" width="16" height="16" fill="#1a1a2e" rx="2" />
      <rect x="5" y="5" width="10" height="10" fill="white" rx="1" />
      <rect x="7" y="7" width="6" height="6" fill="#1a1a2e" rx="0.5" />

      <rect x="46" y="2" width="16" height="16" fill="#1a1a2e" rx="2" />
      <rect x="49" y="5" width="10" height="10" fill="white" rx="1" />
      <rect x="51" y="7" width="6" height="6" fill="#1a1a2e" rx="0.5" />

      <rect x="2" y="46" width="16" height="16" fill="#1a1a2e" rx="2" />
      <rect x="5" y="49" width="10" height="10" fill="white" rx="1" />
      <rect x="7" y="51" width="6" height="6" fill="#1a1a2e" rx="0.5" />

      {/* Data dots */}
      {Array.from({ length: 100 }, (_, i) => {
        const x = 22 + (i % 10) * 3
        const y = 22 + Math.floor(i / 10) * 3
        const show = [0,2,4,5,7,9,10,13,15,18,20,21,24,26,28,31,33,35,37,39,40,42,44,47,49,51,53,55,57,59,60,62,64,66,68,71,73,75,77,80,82,84,86,88,91,93,95,97,99].includes(i)
        return show ? <rect key={i} x={x} y={y} width="2" height="2" fill="#1a1a2e" rx="0.3" /> : null
      })}

      {/* More pattern blocks */}
      <rect x="22" y="2" width="2" height="2" fill="#1a1a2e" />
      <rect x="26" y="4" width="2" height="2" fill="#1a1a2e" />
      <rect x="30" y="2" width="2" height="2" fill="#1a1a2e" />
      <rect x="34" y="6" width="2" height="2" fill="#1a1a2e" />
      <rect x="38" y="4" width="2" height="2" fill="#1a1a2e" />
      <rect x="42" y="2" width="2" height="2" fill="#1a1a2e" />

      <rect x="22" y="10" width="2" height="2" fill="#1a1a2e" />
      <rect x="28" y="12" width="2" height="2" fill="#1a1a2e" />
      <rect x="34" y="10" width="2" height="2" fill="#1a1a2e" />
      <rect x="40" y="14" width="2" height="2" fill="#1a1a2e" />

      <rect x="22" y="46" width="2" height="2" fill="#1a1a2e" />
      <rect x="28" y="48" width="2" height="2" fill="#1a1a2e" />
      <rect x="34" y="50" width="2" height="2" fill="#1a1a2e" />
      <rect x="40" y="46" width="2" height="2" fill="#1a1a2e" />
      <rect x="46" y="48" width="2" height="2" fill="#1a1a2e" />

      <rect x="2" y="22" width="2" height="2" fill="#1a1a2e" />
      <rect x="6" y="26" width="2" height="2" fill="#1a1a2e" />
      <rect x="2" y="30" width="2" height="2" fill="#1a1a2e" />
      <rect x="10" y="34" width="2" height="2" fill="#1a1a2e" />
      <rect x="6" y="38" width="2" height="2" fill="#1a1a2e" />

      <rect x="52" y="22" width="2" height="2" fill="#1a1a2e" />
      <rect x="56" y="28" width="2" height="2" fill="#1a1a2e" />
      <rect x="52" y="34" width="2" height="2" fill="#1a1a2e" />
      <rect x="58" y="38" width="2" height="2" fill="#1a1a2e" />

      <rect x="46" y="52" width="2" height="2" fill="#1a1a2e" />
      <rect x="52" y="54" width="2" height="2" fill="#1a1a2e" />
      <rect x="58" y="52" width="2" height="2" fill="#1a1a2e" />
      <rect x="54" y="58" width="2" height="2" fill="#1a1a2e" />
      <rect x="48" y="58" width="2" height="2" fill="#1a1a2e" />
    </svg>
  )
}

const DEMO_FLIGHT = {
  id: 1,
  flight_number: 'SG-402',
  origin_code: 'LHR',
  destination_code: 'JFK',
  origin_city: 'London',
  destination_city: 'New York',
  gate: 'B24',
  terminal: 'T5',
  status: 'On Time',
  scheduled_time: '10:45',
}
