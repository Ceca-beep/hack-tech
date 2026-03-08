import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { useStore } from '../store'
import { subscribeFlight } from '../api/client'
import FaceEnroll from '../components/Identity/FaceEnroll'

const STEPS = ['Welcome', 'Biometrics', 'Document', 'Ticket']

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { setOnboardingComplete, setDocumentId } = useStore()
  const [step, setStep] = useState(0)

  const finish = () => {
    setOnboardingComplete(true)
    navigate('/map', { replace: true })
  }

  return (
    <div className="min-h-full bg-[#0b1120] flex flex-col">
      {/* Progress dots */}
      {step < 4 && (
        <div className="flex items-center justify-center gap-2 pt-6 pb-2">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? 'w-8 bg-blue-500' : i < step ? 'w-4 bg-blue-500/40' : 'w-4 bg-slate-700'
            }`} />
          ))}
        </div>
      )}

      <div className="flex-1 flex flex-col">
        {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
        {step === 1 && <BiometricStep onNext={() => setStep(2)} onSkip={() => setStep(2)} />}
        {step === 2 && <DocumentStep onNext={() => setStep(3)} onSkip={() => setStep(3)} setDocumentId={setDocumentId} />}
        {step === 3 && <TicketStep onNext={finish} onSkip={finish} />}
      </div>
    </div>
  )
}

/* ─── Step 0: Welcome ──────────────────────────────────────────── */
function WelcomeStep({ onNext }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/30">
        <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-white mb-3">Welcome to SkyGuide</h1>
      <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-2">
        Your personal airport companion. We'll guide you through check-in, security, and all the way to your gate.
      </p>
      <p className="text-slate-500 text-xs leading-relaxed max-w-xs mb-10">
        First, let's set up your digital identity for a seamless airport experience.
      </p>

      <button onClick={onNext}
        className="w-full max-w-xs py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold text-base transition-colors shadow-lg shadow-blue-600/20">
        Get Started
      </button>
    </div>
  )
}

/* ─── Step 1: Biometric (Face Enrollment) ──────────────────────── */
function BiometricStep({ onNext, onSkip }) {
  return (
    <div className="flex-1 flex flex-col px-6 pt-6">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-blue-500/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Biometric Identity</h2>
        <p className="text-sm text-slate-400">
          Enroll your face for hands-free verification at security, lounges, and boarding gates.
        </p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl p-5 mb-4">
        <FaceEnroll onComplete={onNext} />
      </div>

      <button onClick={onSkip} className="py-2.5 text-sm text-slate-500 hover:text-slate-400 transition-colors">
        Skip for now
      </button>
    </div>
  )
}

/* ─── Step 2: Document Submission (mock) ───────────────────────── */
function DocumentStep({ onNext, onSkip, setDocumentId }) {
  const [docType, setDocType] = useState(null) // null | 'passport' | 'national_id'
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)

  const handleSelect = (type) => {
    setDocType(type)
    setVerifying(true)
    // Mock verification delay
    setTimeout(() => {
      setVerifying(false)
      setVerified(true)
      setDocumentId(`mock_${type}_${Date.now()}`)
      // Auto-advance after brief success display
      setTimeout(onNext, 1200)
    }, 2000)
  }

  if (verified) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mb-4 animate-[scale-in_0.3s_ease-out]">
          <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Document Verified</h2>
        <p className="text-sm text-slate-400">{docType === 'passport' ? 'Passport' : 'National ID'} approved</p>
      </div>
    )
  }

  if (verifying) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="animate-spin w-10 h-10 border-3 border-blue-400 border-t-transparent rounded-full mb-4" />
        <h2 className="text-lg font-bold text-white mb-1">Verifying Document</h2>
        <p className="text-sm text-slate-400">Checking {docType === 'passport' ? 'passport' : 'national ID'}...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col px-6 pt-6">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-amber-500/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Travel Document</h2>
        <p className="text-sm text-slate-400">Select your identification type for verification</p>
      </div>

      <div className="space-y-3 mb-6">
        <button onClick={() => handleSelect('passport')}
          className="w-full flex items-center gap-4 p-5 bg-slate-800/50 border border-slate-700/30 rounded-2xl hover:bg-slate-800 hover:border-blue-500/30 transition-all">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="text-white font-semibold">Passport</p>
            <p className="text-xs text-slate-500">International travel document</p>
          </div>
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button onClick={() => handleSelect('national_id')}
          className="w-full flex items-center gap-4 p-5 bg-slate-800/50 border border-slate-700/30 rounded-2xl hover:bg-slate-800 hover:border-blue-500/30 transition-all">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="text-white font-semibold">National ID</p>
            <p className="text-xs text-slate-500">Government-issued identification</p>
          </div>
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <button onClick={onSkip} className="py-2.5 text-sm text-slate-500 hover:text-slate-400 transition-colors">
        Skip for now
      </button>
    </div>
  )
}

/* ─── Step 3: Add Ticket (QR Scan) ─────────────────────────────── */
function TicketStep({ onNext, onSkip }) {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null) // { ok, flight } | { ok: false, message }

  const handleScan = async (ticketData) => {
    setScanning(false)
    try {
      await subscribeFlight(ticketData.flight_id)
      setResult({ ok: true, flight: ticketData.flight_number || ticketData.flight_id })
      setTimeout(onNext, 1500)
    } catch {
      setResult({ ok: false, message: 'Failed to add flight' })
    }
  }

  if (result?.ok) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Flight Added</h2>
        <p className="text-sm text-slate-400">{result.flight} added to your trips</p>
      </div>
    )
  }

  if (scanning) {
    return <TicketScanner onScan={handleScan} onClose={() => setScanning(false)} />
  }

  return (
    <div className="flex-1 flex flex-col px-6 pt-6">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-cyan-500/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Add Your Flight</h2>
        <p className="text-sm text-slate-400">Scan your boarding pass to get started with navigation</p>
      </div>

      <button onClick={() => setScanning(true)}
        className="w-full flex items-center gap-4 p-5 bg-gradient-to-r from-blue-600/15 to-cyan-600/15 border border-blue-500/25 rounded-2xl hover:from-blue-600/25 hover:to-cyan-600/25 transition-all mb-3">
        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <div className="flex-1 text-left">
          <p className="text-white font-semibold">Scan Boarding Pass</p>
          <p className="text-xs text-slate-500">Point camera at ticket QR code</p>
        </div>
        <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {result && !result.ok && (
        <p className="text-red-400 text-sm text-center mb-3">{result.message}</p>
      )}

      <button onClick={onSkip} className="py-2.5 text-sm text-slate-500 hover:text-slate-400 transition-colors">
        Skip — I'll add it later
      </button>
    </div>
  )
}

/* ─── Inline ticket scanner ────────────────────────────────────── */
function parseTicketQR(text) {
  try {
    const data = JSON.parse(text)
    if (data.type === 'skyguide_ticket' && data.flight_id) return data
  } catch {}
  const trimmed = text.trim()
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return { flight_id: trimmed, flight_number: trimmed, type: 'skyguide_ticket' }
  }
  return null
}

function TicketScanner({ onScan, onClose }) {
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan
  const [error, setError] = useState(null)
  const containerRef = useRef(null)
  const scannerRef = useRef(null)

  useEffect(() => {
    let active = true
    const container = containerRef.current
    if (!container) return
    const id = 'ob-qr-' + Date.now()
    container.id = id
    container.innerHTML = ''
    const timeout = setTimeout(() => {
      if (!active) return
      const scanner = new Html5Qrcode(id)
      scannerRef.current = scanner
      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => {
          if (!active) return
          const ticket = parseTicketQR(text)
          if (ticket) {
            active = false
            try { scanner.stop() } catch {}
            onScanRef.current(ticket)
          }
        },
        () => {}
      ).catch(() => { if (active) setError('Camera access denied') })
    }, 150)
    return () => {
      active = false
      clearTimeout(timeout)
      try { scannerRef.current?.stop() } catch {}
      if (container) container.innerHTML = ''
    }
  }, [])

  return (
    <div className="flex-1 flex flex-col px-6 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Scan Boarding Pass</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div ref={containerRef} className="rounded-2xl overflow-hidden bg-black flex-1" style={{ minHeight: 300 }} />
      {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}
    </div>
  )
}
