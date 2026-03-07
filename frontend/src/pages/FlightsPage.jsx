import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { getFlights, getMyFlights, subscribeFlight } from '../api/client'
import BottomNav from '../components/BottomNav'

const STATUS_COLORS = {
  boarding: 'bg-blue-500/20 text-blue-400',
  delayed: 'bg-red-500/20 text-red-400',
  on_time: 'bg-green-500/20 text-green-400',
  scheduled: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  landed: 'bg-slate-500/20 text-slate-400',
  departed: 'bg-cyan-500/20 text-cyan-400',
}

const AIRLINE_COLORS = {
  UA: '#2563eb',
  AA: '#dc2626',
  DL: '#7c3aed',
  B6: '#0891b2',
  SG: '#3b82f6',
  EK: '#f59e0b',
  default: '#3b82f6',
}

function getAirlineColor(flightNum) {
  const prefix = flightNum?.replace(/[0-9]/g, '').trim()
  return AIRLINE_COLORS[prefix] || AIRLINE_COLORS.default
}

export default function FlightsPage() {
  const { accessToken } = useStore()
  const [activeTab, setActiveTab] = useState('my')
  const [direction, setDirection] = useState('departures')
  const [searchQuery, setSearchQuery] = useState('')
  const [flights, setFlights] = useState([])
  const [myFlights, setMyFlights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [allRes, myRes] = await Promise.all([
          getFlights({ direction }),
          getMyFlights(),
        ])
        setFlights(allRes.data || [])
        setMyFlights(myRes.data || [])
      } catch {
        // Use demo data if API fails
        setFlights(DEMO_FLIGHTS)
        setMyFlights(DEMO_FLIGHTS.slice(0, 2))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [direction, accessToken])

  const displayFlights = activeTab === 'my' ? myFlights : flights
  const filtered = displayFlights.filter((f) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      f.flight_number?.toLowerCase().includes(q) ||
      f.origin_code?.toLowerCase().includes(q) ||
      f.destination_code?.toLowerCase().includes(q) ||
      f.origin_city?.toLowerCase().includes(q) ||
      f.destination_city?.toLowerCase().includes(q)
    )
  })

  const handleSubscribe = async (flightId) => {
    try {
      await subscribeFlight(flightId)
      const { data } = await getMyFlights()
      setMyFlights(data || [])
    } catch {}
  }

  return (
    <div className="min-h-full bg-[#0b1120] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <button className="text-slate-400 hover:text-white p-1">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-white tracking-wide">SkyGuide</h1>
        <button className="relative text-slate-400 hover:text-white p-1">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#0b1120]" />
        </button>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search flight or city"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50
                       rounded-xl text-sm text-white placeholder-slate-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 px-5 mb-4">
        <button
          onClick={() => setActiveTab('my')}
          className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
            activeTab === 'my'
              ? 'text-white border-transparent'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          My Flights
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'text-blue-400 border-blue-400'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          All Flights
        </button>
      </div>

      {/* Direction Toggle */}
      <div className="flex mx-5 mb-5 bg-slate-800/40 rounded-xl p-1">
        <button
          onClick={() => setDirection('departures')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            direction === 'departures'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Departures
        </button>
        <button
          onClick={() => setDirection('arrivals')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            direction === 'arrivals'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Arrivals
        </button>
      </div>

      {/* Flight List */}
      <div className="flex-1 px-5 space-y-3 pb-24 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm">No flights found</p>
          </div>
        ) : (
          filtered.map((flight) => (
            <FlightCard
              key={flight.id || flight.flight_number}
              flight={flight}
              onSubscribe={() => handleSubscribe(flight.id)}
              isSubscribed={myFlights.some((f) => f.id === flight.id)}
            />
          ))
        )}
      </div>

      <BottomNav />
    </div>
  )
}

function FlightCard({ flight, onSubscribe, isSubscribed }) {
  const statusKey = flight.status?.toLowerCase().replace(/\s+/g, '_') || 'scheduled'
  const statusColor = STATUS_COLORS[statusKey] || STATUS_COLORS.scheduled
  const airlineColor = getAirlineColor(flight.flight_number)
  const isDelayed = statusKey === 'delayed'

  return (
    <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-4 hover:bg-slate-800/60 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold" style={{ color: airlineColor }}>
          {flight.flight_number}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md ${statusColor}`}>
            {flight.status?.replace(/_/g, ' ') || 'Scheduled'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-white text-lg font-bold">
            {flight.origin_code || 'SFO'}
          </span>
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span className="text-white text-lg font-bold">
            {flight.destination_code || 'JFK'}
          </span>
        </div>
        <span className="text-slate-500 text-xs">
          Gate {flight.gate || '--'}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isDelayed && flight.scheduled_time ? (
            <span className="text-xs">
              <span className="line-through text-slate-600 mr-1">{flight.scheduled_time}</span>
              <span className="text-red-400">{flight.estimated_time || flight.scheduled_time}</span>
            </span>
          ) : (
            <span className="text-xs">{flight.scheduled_time || flight.departure_time || '--:--'}</span>
          )}
        </div>
        <span className="text-slate-500 text-xs">
          Terminal {flight.terminal || '--'}
        </span>
      </div>
    </div>
  )
}

const DEMO_FLIGHTS = [
  {
    id: 1, flight_number: 'UA 2402', origin_code: 'SFO', destination_code: 'JFK',
    status: 'Boarding', gate: 'B12', scheduled_time: '14:30', terminal: '3',
  },
  {
    id: 2, flight_number: 'AA 0941', origin_code: 'LAX', destination_code: 'ORD',
    status: 'Delayed', gate: 'C04', scheduled_time: '15:15', estimated_time: '16:05', terminal: '1',
  },
  {
    id: 3, flight_number: 'DL 4482', origin_code: 'SEA', destination_code: 'ATL',
    status: 'On Time', gate: 'A08', scheduled_time: '17:00', terminal: '2',
  },
  {
    id: 4, flight_number: 'B6 1205', origin_code: 'BOS', destination_code: 'MCO',
    status: 'On Time', gate: 'E02', scheduled_time: '18:45', terminal: 'C',
  },
]
