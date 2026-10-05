'use client'

import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { Simulator, type Snapshot } from '../../lib/sim/simulator'
import type { FaultKey } from '../../lib/sim/config'
import type { FwConfig } from '../../lib/sim/firmware'

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface SimControls {
  /** Inject a fault (severity 0–1, optional gradual ramp in seconds). */
  setFault: (key: FaultKey, severity: number, gradualSec?: number) => void
  /** Clear all faults ("do maintenance"). */
  maintenance: () => void
  /** Toggle mains contactor. */
  setMains: (on: boolean) => void
  /** Reset the protective trip latch. */
  resetTrip: () => void
  /** Patch firmware configuration. */
  setConfig: (patch: Partial<FwConfig>) => void
  /** Pause / resume the simulation. */
  setPaused: (paused: boolean) => void
  /** Set the simulation speed multiplier. */
  setSpeed: (x: number) => void
}

interface SimContextValue {
  snap: Snapshot | null
  controls: SimControls
  paused: boolean
  speed: number
  fps: number
}

/* ------------------------------------------------------------------ */
/* Context                                                              */
/* ------------------------------------------------------------------ */

const SimContext = createContext<SimContextValue | null>(null)

export function useSim(): SimContextValue {
  const ctx = useContext(SimContext)
  if (!ctx) throw new Error('useSim must be used inside <SimProvider>')
  return ctx
}

/* ------------------------------------------------------------------ */
/* Provider                                                             */
/* ------------------------------------------------------------------ */

const SIM_DT = 20          // ms of virtual time per physics step
const SNAP_INTERVAL = 100  // ms between snapshots (10 Hz)

export function SimProvider({ children }: { children: ReactNode }) {
  const simRef = useRef<Simulator | null>(null)
  const [snap, setSnap] = useState<Snapshot | null>(null)
  const [paused, setPausedState] = useState(false)
  const [speed, setSpeedState] = useState(1)
  const [fps, setFps] = useState(0)
  const pausedRef = useRef(paused)
  const speedRef = useRef(speed)

  // Keep refs in sync
  useEffect(() => { pausedRef.current = paused }, [paused])
  useEffect(() => { speedRef.current = speed }, [speed])

  // Initialize simulator once
  useEffect(() => {
    const sim = new Simulator(7)
    simRef.current = sim

    // Warm-up: advance 5 seconds so the motor reaches steady-state
    for (let i = 0; i < 250; i++) sim.advance(SIM_DT)
    setSnap(sim.snapshot())

    // Animation loop
    let frameCount = 0
    let lastFpsTime = performance.now()
    let lastSnapTime = 0
    let raf: number

    const tick = (time: number) => {
      raf = requestAnimationFrame(tick)
      if (pausedRef.current) return

      // Advance the simulation by multiple physics steps per frame
      const steps = Math.max(1, Math.round(speedRef.current))
      for (let i = 0; i < steps; i++) {
        sim.advance(SIM_DT)
      }

      // Snapshot at ~10 Hz (every 100ms real-time)
      if (time - lastSnapTime >= SNAP_INTERVAL) {
        lastSnapTime = time
        setSnap(sim.snapshot())
      }

      // FPS counter
      frameCount++
      if (time - lastFpsTime >= 1000) {
        setFps(frameCount)
        frameCount = 0
        lastFpsTime = time
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Controls
  const setFault = useCallback((key: FaultKey, severity: number, gradualSec?: number) => {
    simRef.current?.setFault(key, severity, gradualSec)
  }, [])

  const maintenance = useCallback(() => {
    simRef.current?.maintenance()
  }, [])

  const setMains = useCallback((on: boolean) => {
    simRef.current?.setMains(on)
  }, [])

  const resetTrip = useCallback(() => {
    simRef.current?.resetTrip()
  }, [])

  const setConfig = useCallback((patch: Partial<FwConfig>) => {
    simRef.current?.setConfig(patch)
  }, [])

  const setPaused = useCallback((p: boolean) => {
    setPausedState(p)
  }, [])

  const setSpeed = useCallback((x: number) => {
    setSpeedState(Math.max(0.5, Math.min(10, x)))
  }, [])

  const controls: SimControls = {
    setFault,
    maintenance,
    setMains,
    resetTrip,
    setConfig,
    setPaused,
    setSpeed,
  }

  return (
    <SimContext.Provider value={{ snap, controls, paused, speed, fps }}>
      {children}
    </SimContext.Provider>
  )
}
