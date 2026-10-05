'use client'

import { useState } from 'react'
import { SimProvider, useSim } from './components/SimProvider'
import {
  Activity,
  Cpu,
  Zap,
  FlaskConical,
  Terminal,
  Gauge,
  Thermometer,
  Waves,
  RotateCw,
  Heart,
  Shield,
  Play,
  Pause,
  FastForward,
  Power,
  RefreshCw,
  Wrench,
  ChevronRight,
} from 'lucide-react'

/* ============================================================
   Lazy-loaded heavy components — keeps initial bundle small
   ============================================================ */

import dynamic from 'next/dynamic'

const GaugeRing = dynamic(() => import('./components/GaugeRing'), { ssr: false })
const Sparkline = dynamic(() => import('./components/Sparkline'), { ssr: false })
const StatusBadge = dynamic(() => import('./components/StatusBadge'), { ssr: false })
const SensorCard = dynamic(() => import('./components/SensorCard'), { ssr: false })
const HealthCard = dynamic(() => import('./components/HealthCard'), { ssr: false })
const IndicatorBar = dynamic(() => import('./components/IndicatorBar'), { ssr: false })
const EvidenceRadar = dynamic(() => import('./components/EvidenceRadar'), { ssr: false })
const TaskTable = dynamic(() => import('./components/TaskTable'), { ssr: false })
const IsrTable = dynamic(() => import('./components/IsrTable'), { ssr: false })
const EventLog = dynamic(() => import('./components/EventLog'), { ssr: false })
const ConsoleView = dynamic(() => import('./components/ConsoleView'), { ssr: false })
const FaultPanel = dynamic(() => import('./components/FaultPanel'), { ssr: false })
const GpioPanel = dynamic(() => import('./components/GpioPanel'), { ssr: false })
const MemoryMap = dynamic(() => import('./components/MemoryMap'), { ssr: false })
const SpecWaterfall = dynamic(() => import('./components/SpecWaterfall'), { ssr: false })

/* ============================================================
   Tabs
   ============================================================ */

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'rtos', label: 'RTOS & Firmware', icon: Cpu },
  { id: 'faults', label: 'Fault Lab', icon: FlaskConical },
  { id: 'log', label: 'System Log', icon: Terminal },
] as const

type TabId = (typeof TABS)[number]['id']

/* ============================================================
   Main Page (wrapped in SimProvider)
   ============================================================ */

export default function Home() {
  return (
    <SimProvider>
      <Dashboard />
    </SimProvider>
  )
}

function Dashboard() {
  const { snap, controls, paused, speed, fps } = useSim()
  const [tab, setTab] = useState<TabId>('overview')

  if (!snap) {
    return (
      <div className="flex-center" style={{ height: '100dvh' }}>
        <div className="flex-col" style={{ alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '3px solid var(--border-medium)',
            borderTopColor: 'var(--cyan)',
            animation: 'spin-slow 1s linear infinite',
          }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Initializing digital twin…
          </span>
        </div>
      </div>
    )
  }

  const stateGlow = snap.state === 'HEALTHY' ? 'glow-emerald'
    : snap.state === 'WARNING' ? 'glow-amber'
    : snap.state === 'CRITICAL' || snap.state === 'TRIPPED' ? 'glow-red'
    : ''

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-logo">
          <div className="header-logo-icon">V</div>
          <div>
            <div className="header-title">VIGIL-M1</div>
            <div className="header-subtitle">Predictive Maintenance Dashboard</div>
          </div>
        </div>

        <div className="header-right">
          {/* State badge */}
          <StatusBadge state={snap.state} />

          {/* Sim time */}
          <div className="mono-sm" style={{ color: 'var(--text-tertiary)' }}>
            T+{formatTime(snap.tMs)}
          </div>

          {/* Sim controls */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button
              className="btn btn-icon"
              onClick={() => controls.setPaused(!paused)}
              title={paused ? 'Resume' : 'Pause'}
            >
              {paused ? <Play size={14} /> : <Pause size={14} />}
            </button>
            <button
              className="btn btn-icon"
              onClick={() => controls.setSpeed(speed >= 5 ? 1 : speed + 1)}
              title={`Speed: ${speed}×`}
            >
              <FastForward size={14} />
            </button>
            <span className="mono-sm" style={{ minWidth: 28, textAlign: 'center', color: 'var(--text-secondary)' }}>
              {speed}×
            </span>
          </div>

          {/* FPS */}
          <div className="mono-sm" style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>
            {fps} fps
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main-content grid-bg">
        {/* Tab nav */}
        <nav className="tab-nav">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div className="animate-fade-in" key={tab}>
          {tab === 'overview' && <OverviewTab snap={snap} controls={controls} />}
          {tab === 'rtos' && <RtosTab snap={snap} />}
          {tab === 'faults' && <FaultsTab snap={snap} />}
          {tab === 'log' && <LogTab snap={snap} />}
        </div>
      </main>
    </>
  )
}

/* ============================================================
   Overview Tab
   ============================================================ */

import { INDICATORS, FAULT_META, CLASS_META, RATED, type FaultKey } from '../lib/sim/config'
import type { Snapshot } from '../lib/sim/simulator'
import type { SimControls } from './components/SimProvider'

function OverviewTab({ snap, controls }: { snap: Snapshot; controls: SimControls }) {
  const trendTemp = ringToArray(snap)
  // We read from the trends embedded in the firmware snapshot
  // For now we'll track a simple window from the events

  return (
    <div className="flex-col gap-lg">
      {/* Row 1: Motor status + Health + Diagnosis */}
      <div className="grid-3 stagger">
        {/* Motor Status */}
        <div className={`card ${stateGlow(snap.state)}`}>
          <div className="card-title"><Shield size={14} /> Motor Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <StatusBadge state={snap.state} />
              <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 8, lineHeight: 1.6 }}>
                {snap.reason}
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button className="btn btn-sm btn-emerald" onClick={() => controls.setMains(true)}>
                  <Power size={12} /> Start
                </button>
                <button className="btn btn-sm" onClick={() => controls.setMains(false)}>
                  <Power size={12} /> Stop
                </button>
                {snap.state === 'TRIPPED' && (
                  <button className="btn btn-sm btn-amber" onClick={() => controls.resetTrip()}>
                    <RefreshCw size={12} /> Reset Trip
                  </button>
                )}
              </div>
            </div>
            <GpioPanel gpio={snap.gpio} />
          </div>
        </div>

        {/* Health Index */}
        <HealthCard />

        {/* Diagnosis */}
        <div className="card">
          <div className="card-title"><Zap size={14} /> Fault Diagnosis</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 18, fontWeight: 700,
                color: snap.diag.cls === 'healthy' ? 'var(--emerald)' : 'var(--amber)',
                marginBottom: 4,
              }}>
                {CLASS_META[snap.diag.cls].label}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.6, marginBottom: 8 }}>
                {snap.diag.detail}
              </p>
              {snap.diag.cls !== 'healthy' && (
                <p style={{ color: 'var(--text-tertiary)', fontSize: 11, lineHeight: 1.5, fontStyle: 'italic' }}>
                  <ChevronRight size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
                  {snap.advice}
                </p>
              )}
              {snap.diag.also.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-tertiary)' }}>
                  Also detected: {snap.diag.also.map(k => CLASS_META[k].label).join(', ')}
                </div>
              )}
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <EvidenceRadar evidence={snap.evidence} />
          </div>
        </div>
      </div>

      {/* Row 2: Sensor gauges */}
      <div className="grid-4 stagger">
        <SensorCard
          label="Temperature" value={snap.meas.tempC} unit="°C"
          icon={<Thermometer size={16} />} color="var(--red)"
          trend={[]} thresholds={{ ok: 55, warn: 70, crit: 85 }} decimals={1}
        />
        <SensorCard
          label="Vibration" value={snap.meas.vibRms} unit="g"
          icon={<Waves size={16} />} color="var(--cyan)"
          trend={[]} thresholds={{ ok: 0.25, warn: 0.35, crit: 0.55 }} decimals={3}
        />
        <SensorCard
          label="Phase Current" value={snap.meas.curRms} unit="A"
          icon={<Zap size={16} />} color="var(--amber)"
          trend={[]} thresholds={{ ok: 4.2, warn: 5.5, crit: 8.2 }} decimals={2}
        />
        <SensorCard
          label="Speed" value={snap.meas.rpm} unit="RPM"
          icon={<RotateCw size={16} />} color="var(--emerald)"
          trend={[]} thresholds={{ ok: 1480, warn: 1400, crit: 1300 }} decimals={0}
        />
      </div>

      {/* Row 3: Indicators + Spectrum */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title"><Gauge size={14} /> Condition Indicators</div>
          <div className="flex-col gap-sm">
            {snap.indicators.map(ind => (
              <IndicatorBar key={ind.def.key} def={ind.def} value={ind.value} level={ind.level} />
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title"><Waves size={14} /> Vibration Spectrum</div>
          <SpecWaterfall specV={snap.meas.vibRms > 0 ? new Float32Array(256) : new Float32Array(256)} frHz={snap.meas.rpm / 60} />
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   RTOS Tab
   ============================================================ */

function RtosTab({ snap }: { snap: Snapshot }) {
  return (
    <div className="flex-col gap-lg">
      {/* MCU overview */}
      <div className="grid-4 stagger">
        <MiniStat label="CPU Load" value={`${(snap.rtos.cpuLoad * 100).toFixed(1)}%`}
          sub={`Peak: ${(snap.rtos.peakLoad * 100).toFixed(0)}%`}
          color={snap.rtos.cpuLoad > 0.9 ? 'var(--red)' : snap.rtos.cpuLoad > 0.7 ? 'var(--amber)' : 'var(--emerald)'} />
        <MiniStat label="Context Switches" value={snap.rtos.ctxSwitches.toLocaleString()}
          sub={`${snap.rtos.preemptions} preemptions`} color="var(--purple)" />
        <MiniStat label="Uptime" value={formatTime(snap.rtos.uptimeMs)}
          sub={`Boot #${snap.rtos.bootCount} · ${snap.rtos.resetReason}`} color="var(--cyan)" />
        <MiniStat label="Watchdog" value={`${snap.rtos.wdgRemainMs.toFixed(0)} ms`}
          sub={`Timeout: ${snap.rtos.wdgTimeoutMs} ms`}
          color={snap.rtos.wdgRemainMs < 500 ? 'var(--red)' : 'var(--emerald)'} />
      </div>

      {/* Task table */}
      <div className="card">
        <div className="card-title"><Cpu size={14} /> RTOS Task Set</div>
        <TaskTable tasks={snap.rtos.tasks} />
      </div>

      {/* ISR table + Memory */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title"><Zap size={14} /> Interrupt Service Routines</div>
          <IsrTable isrs={snap.rtos.isrs} />
        </div>
        <div className="card">
          <div className="card-title"><Activity size={14} /> MCU Memory Map</div>
          <MemoryMap mem={snap.mem} />
        </div>
      </div>

      {/* Sampling chain stats */}
      <div className="grid-4 stagger">
        <MiniStat label="ADC Samples" value={snap.rtos.adcCount.toLocaleString()} sub="12-bit @ 2560 Hz" color="var(--cyan)" />
        <MiniStat label="DMA Overruns" value={String(snap.rtos.dmaOverruns)} sub="Circular buffer" color={snap.rtos.dmaOverruns > 0 ? 'var(--red)' : 'var(--emerald)'} />
        <MiniStat label="DSP Features" value={snap.rtos.featureCount.toLocaleString()} sub="512-pt FFT @ 10 Hz" color="var(--purple)" />
        <MiniStat label="Flash Writes" value={snap.flash.writes.toLocaleString()} sub={`${snap.flash.wraps} wraps · ${snap.flash.erased} erases`} color="var(--orange)" />
      </div>
    </div>
  )
}

/* ============================================================
   Faults Tab
   ============================================================ */

function FaultsTab({ snap }: { snap: Snapshot }) {
  return (
    <div className="flex-col gap-lg">
      <FaultPanel />

      {/* Current fault state */}
      <div className="card">
        <div className="card-title"><Activity size={14} /> Active Faults</div>
        <div className="grid-3">
          {snap.faults.map(f => (
            <div key={f.key} style={{
              padding: 12, borderRadius: 'var(--r-md)',
              background: f.current > 0 ? 'rgba(248,113,113,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${f.current > 0 ? 'rgba(248,113,113,0.15)' : 'var(--border-subtle)'}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: f.current > 0 ? 'var(--red)' : 'var(--text-tertiary)', marginBottom: 4 }}>
                {FAULT_META[f.key].label}
              </div>
              <div className="mono" style={{ fontSize: 20, color: f.current > 0 ? 'var(--red)' : 'var(--text-tertiary)' }}>
                {(f.current * 100).toFixed(0)}%
              </div>
              {f.current !== f.target && (
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  → {(f.target * 100).toFixed(0)}% at {(f.rate * 100).toFixed(1)}%/s
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Communication */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title"><Terminal size={14} /> Telemetry Link</div>
          <div className="grid-2" style={{ gap: 8 }}>
            <StatLine label="Frames OK" value={snap.host.rxOk} />
            <StatLine label="CRC Errors" value={snap.host.crcErr} bad={snap.host.crcErr > 0} />
            <StatLine label="Last Seq" value={snap.host.lastSeq} />
            <StatLine label="Bytes TX" value={snap.host.bytesTx} />
            <StatLine label="Modbus OK" value={snap.host.modbusOk ? 'Yes' : 'No'} />
            <StatLine label="Modbus Regs" value={snap.host.modbusRegs.length} />
          </div>
          {snap.host.frame && (
            <div style={{ marginTop: 12, padding: 8, borderRadius: 'var(--r-sm)', background: 'rgba(0,0,0,0.3)', overflowX: 'auto' }}>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>Last telemetry frame (hex):</div>
              <code className="mono-sm" style={{ color: snap.host.frameOk ? 'var(--cyan)' : 'var(--red)', wordBreak: 'break-all', fontSize: 10 }}>
                {Array.from(snap.host.frame).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')}
              </code>
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-title"><Shield size={14} /> Protection Config</div>
          <div className="flex-col gap-sm">
            <ConfigRow label="Auto-trip on critical" value={snap.cfg.autoProtect ? 'ON' : 'OFF'}
              toggle={() => {
                // We'll need controls here - use useSim
              }} />
            <ConfigRow label="Trip delay" value={`${snap.cfg.tripDelayMs} ms`} />
            <ConfigRow label="Warn debounce" value={`${snap.cfg.warnDebounce} cycles`} />
            <ConfigRow label="Crit debounce" value={`${snap.cfg.critDebounce} cycles`} />
            <ConfigRow label="Clear debounce" value={`${snap.cfg.clearDebounce} cycles`} />
            <ConfigRow label="Clock" value={`${snap.cfg.clockMHz} MHz`} />
            <ConfigRow label="UART noise" value={`${(snap.cfg.uartNoise * 100).toFixed(0)}%`} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   Log Tab
   ============================================================ */

function LogTab({ snap }: { snap: Snapshot }) {
  return (
    <div className="flex-col gap-lg">
      <div className="grid-2">
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div className="card-title"><Terminal size={14} /> Event Log</div>
          <EventLog events={snap.events} />
        </div>
        <div className="card">
          <div className="card-title"><Terminal size={14} /> Firmware Console</div>
          <ConsoleView lines={snap.console} />
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   Helper components
   ============================================================ */

function MiniStat({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
        {label}
      </div>
      <div className="mono-lg" style={{ color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{sub}</div>
    </div>
  )
}

function StatLine({ label, value, bad }: { label: string; value: string | number; bad?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
      <span className="mono-sm" style={{ color: bad ? 'var(--red)' : 'var(--text-mono)' }}>{value}</span>
    </div>
  )
}

function ConfigRow({ label, value, toggle }: { label: string; value: string; toggle?: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
      <span className="mono-sm" style={{ color: 'var(--text-mono)' }}>{value}</span>
    </div>
  )
}

/* ============================================================
   Utilities
   ============================================================ */

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`
  return `${s}s`
}

function stateGlow(state: string): string {
  if (state === 'HEALTHY') return 'glow-emerald'
  if (state === 'WARNING') return 'glow-amber'
  if (state === 'CRITICAL' || state === 'TRIPPED') return 'glow-red'
  return ''
}

function ringToArray(snap: Snapshot): number[] {
  // placeholder — real trend data will come from firmware.trend
  return []
}
