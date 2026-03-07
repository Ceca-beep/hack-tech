import { useEffect, useRef, useState, useCallback } from 'react'

const SAMPLE_RATE_MS = 50

// Step detection parameters
const STEP_THRESHOLD = 12.5   // m/s² — accel magnitude peak to count as a step
const STEP_COOLDOWN_MS = 300  // minimum time between steps
const STEP_LENGTH_M = 0.7     // average step length in metres

export function useIMU() {
  const [isAvailable, setIsAvailable] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const accelRef = useRef({ x: 0, y: 0, z: 0 })
  const gyroRef = useRef({ x: 0, y: 0, z: 0 })
  const headingRef = useRef(0)
  const [accel, setAccel] = useState({ x: 0, y: 0, z: 0 })
  const [gyro, setGyro] = useState({ x: 0, y: 0, z: 0 })
  const [heading, setHeading] = useState(0)

  // Step detection state
  const stepCountRef = useRef(0)
  const [stepCount, setStepCount] = useState(0)
  const lastStepTimeRef = useRef(0)
  const prevMagRef = useRef(9.8)
  const risingRef = useRef(false)
  const onStepRef = useRef(null)

  const requestPermission = useCallback(async () => {
    // iOS 13+ requires explicit permission request triggered by user gesture
    if (typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const motionPerm = await DeviceMotionEvent.requestPermission()
        const orientPerm = await DeviceOrientationEvent.requestPermission()
        if (motionPerm === 'granted' && orientPerm === 'granted') {
          setPermissionGranted(true)
          return true
        }
        return false
      } catch {
        return false
      }
    }
    // Non-iOS: permission is implicit
    setPermissionGranted(true)
    return true
  }, [])

  useEffect(() => {
    const hasMotion = 'DeviceMotionEvent' in window
    const hasOrientation = 'DeviceOrientationEvent' in window
    setIsAvailable(hasMotion && hasOrientation)

    if (!hasMotion || !hasOrientation) return

    // Auto-grant on non-iOS
    if (typeof DeviceMotionEvent.requestPermission !== 'function') {
      setPermissionGranted(true)
    }
  }, [])

  useEffect(() => {
    if (!permissionGranted) return

    const handleMotion = (e) => {
      const a = e.accelerationIncludingGravity || {}
      const r = e.rotationRate || {}
      accelRef.current = {
        x: a.x ?? 0,
        y: a.y ?? 0,
        z: a.z ?? 0,
      }
      gyroRef.current = {
        x: r.alpha ?? 0,
        y: r.beta ?? 0,
        z: r.gamma ?? 0,
      }

      // Step detection: peak detection on acceleration magnitude
      const mag = Math.sqrt(
        (a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2
      )
      const prev = prevMagRef.current
      const now = Date.now()

      if (mag > prev) {
        risingRef.current = true
      } else if (risingRef.current && prev >= STEP_THRESHOLD) {
        // We were rising and just peaked above threshold — count a step
        risingRef.current = false
        if (now - lastStepTimeRef.current > STEP_COOLDOWN_MS) {
          lastStepTimeRef.current = now
          stepCountRef.current += 1
          // Fire callback with current heading
          if (onStepRef.current) {
            onStepRef.current(headingRef.current, STEP_LENGTH_M)
          }
        }
      } else {
        risingRef.current = false
      }

      prevMagRef.current = mag
    }

    const handleOrientation = (e) => {
      if (e.webkitCompassHeading !== undefined) {
        headingRef.current = e.webkitCompassHeading
      } else if (e.alpha !== null) {
        headingRef.current = (360 - e.alpha) % 360
      }
    }

    window.addEventListener('devicemotion', handleMotion, { passive: true })
    window.addEventListener('deviceorientation', handleOrientation, { passive: true })

    // Throttled state updates
    const interval = setInterval(() => {
      setAccel({ ...accelRef.current })
      setGyro({ ...gyroRef.current })
      setHeading(headingRef.current)
      setStepCount(stepCountRef.current)
    }, SAMPLE_RATE_MS)

    return () => {
      window.removeEventListener('devicemotion', handleMotion)
      window.removeEventListener('deviceorientation', handleOrientation)
      clearInterval(interval)
    }
  }, [permissionGranted])

  // Register a step callback — called with (headingDeg, stepLengthM) on each detected step
  const setOnStep = useCallback((fn) => {
    onStepRef.current = fn
  }, [])

  return {
    accel,
    gyro,
    heading,
    stepCount,
    isAvailable,
    permissionGranted,
    requestPermission,
    setOnStep,
  }
}
