'use client'

import { motion, type Variants } from 'motion/react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useSnap, useStore } from '@/components/sim/SimProvider'
import { TASK_SPECS } from '@/lib/sim/config'
import { SLIDES, type SlideDef } from './slides'

const PresentScene = dynamic(() => import('./PresentScene'), { ssr: false })

/* ---------- small building blocks ---------- */

const rise: Variants = {
  hidden: { opacity: 0, y: 38 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.12 + i * 0.09, duration: 0.6, ease: [0.2, 0.9, 0.25, 1] } }),
}

function Item({ i = 0, children, className }: { i?: number; children: ReactNode; className?: string }) {
  return (
    <motion.div variants={rise} custom={i} className={className}>
      {children}
    </motion.div>
  )
}

/** A dark panel colour that always reads against white text, whatever the slide's ink is. */
const panel = (s: SlideDef) => (s.ink === '#ffffff' ? '#150f33' : s.ink)

const Kicker = ({ children, s }: { children: ReactNode; s: SlideDef }) => (
  <span
    className="inline-block rounded-full px-4 py-1.5 font-mono text-[clamp(11px,1.05vw,15px)] font-bold uppercase tracking-[0.14em]"
    style={{ background: s.ink, color: s.bg }}
  >
    {children}
  </span>
)

const Head = ({ children, size = 'xl' }: { children: ReactNode; size?: 'xl' | 'lg' }) => (
  <h1
    className="font-display font-black uppercase leading-[0.88] tracking-[-0.01em]"
    style={{ fontSize: size === 'xl' ? 'clamp(3rem, 7.4vw, 8.4rem)' : 'clamp(2.6rem, 6vw, 6.6rem)' }}
  >
    {children}
  </h1>
)

const Body = ({ children }: { children: ReactNode }) => (
  <p className="max-w-[30ch] font-sans font-medium leading-[1.2]" style={{ fontSize: 'clamp(1.25rem, 2.15vw, 2.4rem)' }}>
    {children}
  </p>
)

const Pop = ({ s, children }: { s: SlideDef; children: ReactNode }) => <span style={{ color: s.pop }}>{children}</span>

function Chip({ s, children, solid }: { s: SlideDef; children: ReactNode; solid?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 font-sans font-bold"
      style={{
        fontSize: 'clamp(1rem, 1.55vw, 1.7rem)',
        background: solid ? s.pop : 'transparent',
        color: solid ? s.bg : 'inherit',
        border: solid ? 'none' : `3px solid ${s.ink}`,
      }}
    >
      {children}
    </span>
  )
}

/** A big live number read straight from the running simulation. */
function Live({ s, label, pick, unit, digits = 1 }: { s: SlideDef; label: string; pick: (m: Meas) => number; unit: string; digits?: number }) {
  const v = useSnap((x) => pick(x.meas))
  return (
    <div className="inline-block rounded-3xl px-6 py-4" style={{ background: s.ink, color: s.bg }}>
      <div className="font-mono text-[clamp(10px,0.95vw,14px)] font-bold uppercase tracking-[0.16em] opacity-80">{label} · live</div>
      <div className="font-display font-black leading-none tabular-nums" style={{ fontSize: 'clamp(3rem, 6.4vw, 7rem)' }}>
        {v.toFixed(digits)}
        <span className="ml-2 text-[0.38em]">{unit}</span>
      </div>
    </div>
  )
}
type Meas = { vibRms: number; tempC: number; curRms: number; rpm: number }

function StateBadge({ s }: { s: SlideDef }) {
  const state = useSnap((x) => x.state)
  const reason = useSnap((x) => x.reason)
  const col = { HEALTHY: '#2ee67c', WARNING: '#ffb21e', CRITICAL: '#ff3b30', TRIPPED: '#ff3b30', STARTUP: '#5c9dff', OFF: '#8a8f98' }[state]
  return (
    <div className="inline-flex max-w-[34ch] items-center gap-4 rounded-3xl px-6 py-4" style={{ background: panel(s), color: '#fff' }}>
      <span className="h-6 w-6 shrink-0 rounded-full" style={{ background: col, boxShadow: `0 0 24px 4px ${col}`, animation: state === 'HEALTHY' ? undefined : 'pres-pulse 0.9s ease-in-out infinite' }} />
      <div>
        <div className="font-display text-[clamp(1.8rem,3.4vw,3.6rem)] font-black uppercase leading-none">{state}</div>
        <div className="mt-1 font-sans text-[clamp(0.85rem,1.1vw,1.2rem)] leading-tight opacity-80">{reason}</div>
      </div>
    </div>
  )
}

function HealthBar({ s }: { s: SlideDef }) {
  const hi = useSnap((x) => x.health.hi)
  const txt = useSnap((x) => x.health.predText)
  const pct = Math.max(0, Math.min(100, hi))
  return (
    <div className="w-[min(34rem,90%)]">
      <div className="mb-2 flex items-end justify-between font-mono text-[clamp(11px,1vw,14px)] font-bold uppercase tracking-[0.14em]">
        <span>Health score</span>
        <span className="font-display text-[2.6em] leading-none tabular-nums">{pct.toFixed(0)}</span>
      </div>
      <div className="h-6 overflow-hidden rounded-full" style={{ background: `${s.ink}33` }}>
        <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, background: s.ink }} />
      </div>
      <p className="mt-3 min-h-[2.4em] font-sans text-[clamp(0.95rem,1.3vw,1.4rem)] font-semibold leading-tight">{txt}</p>
    </div>
  )
}

/* ---------- the slides ---------- */

type Content = { head: ReactNode; extra?: ReactNode }

function content(id: string, s: SlideDef): Content {
  switch (id) {
    case 'title':
      return {
        head: (
          <>
            <Item><Kicker s={s}>Embedded systems · college project</Kicker></Item>
            <Item i={1}><div className="font-stencil font-black uppercase leading-[0.8]" style={{ fontSize: 'clamp(6rem, 17vw, 19rem)', letterSpacing: '-0.01em' }}>Vigil</div></Item>
            <Item i={2}><Body>A tiny computer that listens to a motor and warns us <Pop s={s}>before it breaks.</Pop></Body></Item>
            <Item i={3}><p className="font-mono text-[clamp(11px,1vw,14px)] font-bold uppercase tracking-[0.18em] opacity-80">Press → or space to begin</p></Item>
          </>
        ),
      }
    case 'problem':
      return {
        head: (
          <>
            <Item><Kicker s={s}>The problem</Kicker></Item>
            <Item i={1}><Head>Motors break <Pop s={s}>without warning</Pop></Head></Item>
            <Item i={2}><Body>Factories run on electric motors. When one dies suddenly, everything stops.</Body></Item>
            <Item i={3} className="flex flex-wrap gap-3"><Chip s={s}>🏭 Line stops</Chip><Chip s={s}>💸 Rush repair</Chip><Chip s={s}>⚠️ Safety risk</Chip></Item>
          </>
        ),
      }
    case 'idea':
      return {
        head: (
          <>
            <Item><Kicker s={s}>The idea</Kicker></Item>
            <Item i={1}><Head>Give the motor a <Pop s={s}>doctor</Pop></Head></Item>
            <Item i={2}><Body>Sensors take its pulse hundreds of times a second. A check-up that never sleeps.</Body></Item>
          </>
        ),
        extra: (
          <Item i={3} className="flex flex-wrap items-center gap-3">
            <Chip s={s} solid>1 · Sense</Chip><span className="text-3xl font-black">→</span>
            <Chip s={s} solid>2 · Think</Chip><span className="text-3xl font-black">→</span>
            <Chip s={s} solid>3 · Act</Chip>
          </Item>
        ),
      }
    case 'motor':
      return {
        head: (
          <>
            <Item><Kicker s={s}>Meet the patient</Kicker></Item>
            <Item i={1}><Head>The <Pop s={s}>motor</Pop></Head></Item>
            <Item i={2}><Body>Electricity spins the shaft about 25 times every second. Pumps, fans and belts hang off it.</Body></Item>
          </>
        ),
        extra: (
          <Item i={3} className="flex flex-wrap gap-3">
            <Chip s={s} solid>1480 rpm</Chip><Chip s={s} solid>4.2 A</Chip><Chip s={s} solid>55 °C</Chip>
            <span className="self-center font-sans text-[clamp(1rem,1.4vw,1.5rem)] font-semibold">when healthy</span>
          </Item>
        ),
      }
    case 'vibration':
      return {
        head: (
          <>
            <Item><Kicker s={s}>Sense #1 · feel</Kicker></Item>
            <Item i={1}><Head><Pop s={s}>Vibration</Pop></Head></Item>
            <Item i={2}><Body>A tiny sensor feels the shaking. Smooth motors hum. A worn bearing rattles.</Body></Item>
          </>
        ),
        extra: <Item i={3}><Live s={s} label="Vibration" pick={(m) => m.vibRms} unit="g" digits={2} /></Item>,
      }
    case 'temperature':
      return {
        head: (
          <>
            <Item><Kicker s={s}>Sense #2 · heat</Kicker></Item>
            <Item i={1}><Head><Pop s={s}>Temp&shy;erature</Pop></Head></Item>
            <Item i={2}><Body>Overwork makes the windings hot. Healthy is about 55 °C, overloaded about 78 °C.</Body></Item>
          </>
        ),
        extra: <Item i={3}><Live s={s} label="Winding" pick={(m) => m.tempC} unit="°C" /></Item>,
      }
    case 'current':
      return {
        head: (
          <>
            <Item><Kicker s={s}>Sense #3 · electricity</Kicker></Item>
            <Item i={1}><Head><Pop s={s}>Current</Pop></Head></Item>
            <Item i={2}><Body>How hard the motor pulls from the wall. Struggling motors pull more: 4.2 A relaxed, 7.8 A overloaded.</Body></Item>
          </>
        ),
        extra: <Item i={3}><Live s={s} label="Current" pick={(m) => m.curRms} unit="A" /></Item>,
      }
    case 'speed':
      return {
        head: (
          <>
            <Item><Kicker s={s}>Sense #4 · speed</Kicker></Item>
            <Item i={1}><Head><Pop s={s}>Speed</Pop></Head></Item>
            <Item i={2}><Body>A magnet on the shaft passes a sensor each turn. Slower than usual means a heavy load.</Body></Item>
          </>
        ),
        extra: <Item i={3}><Live s={s} label="Shaft" pick={(m) => m.rpm} unit="rpm" digits={0} /></Item>,
      }
    case 'brain':
      return {
        head: (
          <>
            <Item><Kicker s={s}>The brain</Kicker></Item>
            <Item i={1}><Head>A <Pop s={s}>micro&shy;controller</Pop></Head></Item>
            <Item i={2}><Body>A chip the size of a coin does three jobs, all day long:</Body></Item>
          </>
        ),
        extra: (
          <div className="grid max-w-[44rem] gap-3">
            {[
              ['ADC', 'turns sensor voltages into numbers'],
              ['Timers', 'tick at one exact, steady rhythm'],
              ['Interrupts', '“new data!” taps on the shoulder'],
            ].map(([a, b], i) => (
              <Item key={a} i={3 + i}>
                <div className="flex items-center gap-4 rounded-2xl px-5 py-3" style={{ background: s.ink, color: s.bg }}>
                  <span className="font-display text-[clamp(1.6rem,2.8vw,3rem)] font-black uppercase leading-none" style={{ color: s.bg }}>{a}</span>
                  <span className="font-sans text-[clamp(0.95rem,1.4vw,1.5rem)] font-semibold leading-tight" style={{ color: '#fff' }}>{b}</span>
                </div>
              </Item>
            ))}
          </div>
        ),
      }
    case 'pipeline':
      return {
        head: (
          <>
            <Item><Kicker s={s}>Thinking</Kicker></Item>
            <Item i={1}><Head size="lg">From wiggles to a <Pop s={s}>decision</Pop></Head></Item>
          </>
        ),
        extra: <Pipeline s={s} />,
      }
    case 'rtos':
      return {
        head: (
          <>
            <Item><Kicker s={s}>Doing many things at once</Kicker></Item>
            <Item i={1}><Head><Pop s={s}>Urgent</Pop> first</Head></Item>
            <Item i={2}><Body>A real-time OS juggles jobs by priority, like a chef: the burning pan beats chopping salad.</Body></Item>
          </>
        ),
        extra: <Tasks s={s} />,
      }
    case 'light':
      return {
        head: (
          <>
            <Item><Kicker s={s}>The answer</Kicker></Item>
            <Item i={1}><Head>A traffic light <Pop s={s}>for motors</Pop></Head></Item>
            <Item i={2}><Body>Green is fine. Yellow means look soon. Red means act now.</Body></Item>
          </>
        ),
        extra: <Item i={3}><StateBadge s={s} /></Item>,
      }
    case 'wear':
      return {
        head: (
          <>
            <Item><Kicker s={s}>Predict</Kicker></Item>
            <Item i={1}><Head>Catch it <Pop s={s}>while it’s small</Pop></Head></Item>
            <Item i={2}><Body>A bearing wears out slowly. Vigil sees the trend and forecasts the failure.</Body></Item>
          </>
        ),
        extra: (
          <Item i={3} className="grid gap-5">
            <HealthBar s={s} />
            <StateBadge s={s} />
          </Item>
        ),
      }
    case 'trip':
      return {
        head: (
          <>
            <Item><Kicker s={s}>Protect</Kicker></Item>
            <Item i={1}><Head>Red? <Pop s={s}>Switch it off.</Pop></Head></Item>
            <Item i={2}><Body>After a few seconds in red, the firmware opens the contactor. The motor coasts to a stop, before it seizes.</Body></Item>
          </>
        ),
        extra: <Item i={3}><StateBadge s={s} /></Item>,
      }
    case 'numbers':
      return {
        head: (
          <>
            <Item><Kicker s={s}>The proof</Kicker></Item>
            <Item i={1}><Head size="lg">Healthy vs <Pop s={s}>struggling</Pop></Head></Item>
          </>
        ),
        extra: (
          <Item i={2}>
            <div className="grid w-[min(36rem,92%)] grid-cols-[1.3fr_1fr_1fr] gap-x-4 gap-y-2 rounded-3xl p-5 font-sans" style={{ background: panel(s), color: '#fff' }}>
              {['', 'Healthy', 'Overloaded'].map((h) => (
                <div key={h} className="font-mono text-[clamp(10px,1vw,14px)] font-bold uppercase tracking-[0.14em] opacity-70">{h}</div>
              ))}
              {[
                ['Temperature', '55 °C', '78 °C'],
                ['Vibration', '0.25 g', '0.40 g'],
                ['Current', '4.2 A', '7.8 A'],
                ['Speed', '1480 rpm', '1350 rpm'],
              ].map(([k, a, b]) => (
                <div key={k} className="contents">
                  <div className="text-[clamp(1rem,1.5vw,1.6rem)] font-semibold opacity-90">{k}</div>
                  <div className="font-display text-[clamp(1.5rem,2.5vw,2.8rem)] font-black leading-none" style={{ color: '#2ee67c' }}>{a}</div>
                  <div className="font-display text-[clamp(1.5rem,2.5vw,2.8rem)] font-black leading-none" style={{ color: '#ffb21e' }}>{b}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 font-sans text-[clamp(1.1rem,1.8vw,2rem)] font-bold">Warning raised in about <Pop s={s}>⅓ of a second</Pop>.</p>
          </Item>
        ),
      }
    case 'concepts':
      return {
        head: (
          <>
            <Item><Kicker s={s}>What we built</Kicker></Item>
            <Item i={1}><Head size="lg">Every idea, <Pop s={s}>running live</Pop></Head></Item>
          </>
        ),
        extra: (
          <Item i={2} className="flex max-w-[90rem] flex-wrap gap-3">
            {['Real-time sensing', 'ADC', 'Timers', 'Interrupts', 'RTOS', 'Task priorities', 'Serial protocol', 'Signal processing (FFT)', 'Fault detection', 'Data logging', 'Fast response'].map((t, i) => (
              <motion.span
                key={t}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.07, type: 'spring', stiffness: 260, damping: 16 }}
                className="rounded-full px-5 py-2.5 font-sans font-bold"
                style={{ fontSize: 'clamp(1rem,1.7vw,1.9rem)', background: i % 2 ? s.pop : '#fff', color: '#1a0b2e' }}
              >
                {t}
              </motion.span>
            ))}
          </Item>
        ),
      }
    case 'thanks':
      return {
        head: (
          <>
            <Item><Kicker s={s}>The end</Kicker></Item>
            <Item i={1}><Head>Thank <Pop s={s}>you!</Pop></Head></Item>
            <Item i={2}><Body>No hardware needed. It all runs as a live simulation. Break the motor yourself.</Body></Item>
            <Item i={3} className="flex flex-wrap gap-3">
              <Link href="/control-room" className="pointer-events-auto rounded-full px-8 py-4 font-display text-[clamp(1.4rem,2.2vw,2.4rem)] font-black uppercase leading-none" style={{ background: s.ink, color: s.bg }}>
                Open the control room →
              </Link>
            </Item>
          </>
        ),
      }
  }
  return { head: null }
}

const STEPS = [
  ['Sample', 'read the sensors 2,560 times a second'],
  ['Filter', 'clean out the noise'],
  ['FFT', 'split shaking into pitches, like an equaliser'],
  ['Features', 'boil it down to a few numbers'],
  ['Decide', 'healthy, warning or critical?'],
]

function Pipeline({ s }: { s: SlideDef }) {
  return (
    <div className="grid w-full max-w-[110rem] grid-cols-2 gap-3 md:grid-cols-5">
      {STEPS.map(([a, b], i) => (
        <Item key={a} i={2 + i}>
          <div className="relative overflow-hidden rounded-3xl p-5" style={{ background: panel(s), color: '#fff', minHeight: '9rem' }}>
            <div className="absolute inset-0" style={{ background: s.pop, opacity: 0, animation: `pres-flash 5s ${i}s infinite` }} />
            <div className="relative">
              <div className="font-mono text-[clamp(10px,1vw,14px)] font-bold tracking-[0.14em] opacity-70">STEP {i + 1}</div>
              <div className="font-display text-[clamp(1.8rem,3vw,3.2rem)] font-black uppercase leading-none">{a}</div>
              <div className="mt-2 font-sans text-[clamp(0.9rem,1.25vw,1.4rem)] font-semibold leading-tight opacity-90">{b}</div>
            </div>
          </div>
        </Item>
      ))}
      <style>{`
        @keyframes pres-flash { 0%{opacity:0} 4%{opacity:.95} 18%{opacity:.95} 24%{opacity:0} 100%{opacity:0} }
      `}</style>
    </div>
  )
}

function Tasks({ s }: { s: SlideDef }) {
  const tasks = useMemo(() => [...TASK_SPECS].sort((a, b) => b.prio - a.prio), [])
  return (
    <div className="grid w-[min(36rem,92%)] gap-2">
      {tasks.map((t, i) => (
        <Item key={t.id} i={3 + i}>
          <div className="relative overflow-hidden rounded-2xl px-5 py-2" style={{ background: panel(s), color: '#fff' }}>
            <div
              className="absolute inset-y-0 left-0"
              style={{ width: '28%', background: t.color, opacity: 0.9, animation: `pres-sweep ${Math.max(0.9, t.periodMs / 55)}s linear infinite` }}
            />
            <div className="relative flex items-baseline justify-between gap-4">
              <span className="font-display text-[clamp(1.2rem,1.9vw,2.1rem)] font-black uppercase leading-none mix-blend-difference">{t.id}</span>
              <span className="font-sans text-[clamp(0.85rem,1.2vw,1.3rem)] font-semibold mix-blend-difference">{t.name} · P{t.prio}</span>
            </div>
          </div>
        </Item>
      ))}
      <style>{`
        @keyframes pres-sweep { 0%{transform:translateX(-100%)} 100%{transform:translateX(360%)} }
      `}</style>
    </div>
  )
}

/* ---------- the deck ---------- */

function toggleFull() {
  if (document.fullscreenElement) void document.exitFullscreen()
  else void document.documentElement.requestFullscreen?.()
}

export function Presentation() {
  const store = useStore()
  const [i, setI] = useState(0)
  const idx = useRef(0)
  const [full, setFull] = useState(false)
  const touch = useRef<number | null>(null)
  const n = SLIDES.length
  const s = SLIDES[i]

  const go = useCallback(
    (to: number) => {
      const t = Math.max(0, Math.min(n - 1, to))
      if (t === idx.current) return
      idx.current = t
      setI(t)
    },
    [n],
  )

  // the first slide's motor state; let the simulator run even if the boot splash is still up
  useEffect(() => {
    store.release()
    store.setPaused(false)
    store.setSpeed(1)
    return () => {
      store.maintenance()
      store.resetTrip()
      store.setConfig({ autoProtect: false })
    }
  }, [store])

  useEffect(() => {
    SLIDES[i].enter?.(store)
  }, [i, store])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault()
        go(idx.current + 1)
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) {
        e.preventDefault()
        go(idx.current - 1)
      } else if (e.key === 'Home') go(0)
      else if (e.key === 'End') go(n - 1)
      else if (e.key === 'f' || e.key === 'F') toggleFull()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, n])

  useEffect(() => {
    const f = () => setFull(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', f)
    return () => document.removeEventListener('fullscreenchange', f)
  }, [])

  const c = useMemo(() => content(s.id, s), [s])
  const center = s.model === 'center'
  const textRight = s.model === 'left'

  const frame: CSSProperties = { background: s.bg, color: s.ink, transition: 'background-color 0.8s ease, color 0.8s ease' }

  return (
    <div
      className="fixed inset-0 z-[300] overflow-hidden"
      style={frame}
      onTouchStart={(e) => {
        touch.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        if (touch.current == null) return
        const dx = e.changedTouches[0].clientX - touch.current
        if (Math.abs(dx) > 50) go(idx.current + (dx < 0 ? 1 : -1))
        touch.current = null
      }}
    >
      {/* giant slide number behind everything */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[0.14em] select-none font-display font-black leading-none"
        style={{
          fontSize: 'clamp(14rem, 44vw, 52rem)',
          opacity: 0.1,
          color: s.ink,
          [textRight ? 'left' : 'right']: '-0.04em',
          transition: 'color 0.8s ease',
        }}
      >
        {String(i + 1).padStart(2, '0')}
      </div>

      <div className="absolute inset-0 z-[1]">
        <PresentScene store={store} index={idx} />
      </div>

      {/* text layer */}
      <div
        key={s.id}
        className={`pointer-events-none absolute inset-0 z-[2] flex flex-col px-[clamp(1.2rem,5vw,6rem)] pb-[clamp(5rem,9vh,7rem)] pt-[clamp(4.5rem,9vh,7rem)] ${
          center ? 'justify-between' : 'justify-center'
        } ${textRight ? 'items-end' : 'items-start'}`}
      >
        <motion.div
          initial="hidden"
          animate="show"
          className="flex flex-col items-start"
          style={{ gap: 'clamp(0.8rem, 2vh, 1.6rem)', maxWidth: center ? '70rem' : 'min(48rem, 43vw)' }}
        >
          {c.head}
          {!center && c.extra && <div className="mt-[clamp(0.4rem,1.4vh,1.2rem)] flex flex-col gap-4">{c.extra}</div>}
        </motion.div>
        {center && c.extra && (
          <motion.div initial="hidden" animate="show" className="flex w-full flex-col items-start gap-4">
            {c.extra}
          </motion.div>
        )}
      </div>

      {/* top bar */}
      <div className="absolute inset-x-0 top-0 z-[3] flex items-center justify-between px-[clamp(1.2rem,5vw,6rem)] pt-5">
        <div className="font-stencil text-[clamp(1.4rem,2vw,2.2rem)] font-black uppercase leading-none">Vigil</div>
        <div className="font-mono text-[12px] font-bold tracking-[0.16em]">
          {String(i + 1).padStart(2, '0')} / {n}
        </div>
      </div>

      {/* bottom bar */}
      <div className="absolute inset-x-0 bottom-0 z-[3] flex items-center justify-between gap-4 px-[clamp(1.2rem,5vw,6rem)] pb-5">
        <div className="flex flex-1 items-center gap-1.5">
          {SLIDES.map((d, k) => (
            <button
              key={d.id}
              aria-label={`Go to slide ${k + 1}`}
              onClick={() => go(k)}
              className="h-3 flex-1 max-w-10 cursor-pointer rounded-full transition-all"
              style={{ background: s.ink, opacity: k === i ? 1 : k < i ? 0.45 : 0.18, transform: k === i ? 'scaleY(1.6)' : undefined }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <NavBtn s={s} label="Previous" onClick={() => go(i - 1)} disabled={i === 0}>←</NavBtn>
          <NavBtn s={s} label="Next" onClick={() => go(i + 1)} disabled={i === n - 1}>→</NavBtn>
          <NavBtn s={s} label={full ? 'Exit full screen' : 'Full screen'} onClick={toggleFull}>⛶</NavBtn>
          <Link href="/" className="rounded-full px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em]" style={{ border: `2px solid ${s.ink}` }}>
            Exit
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes pres-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.35)} }
      `}</style>
    </div>
  )
}

function NavBtn({ s, label, onClick, disabled, children }: { s: SlideDef; label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-11 w-11 cursor-pointer place-items-center rounded-full text-xl font-black transition disabled:cursor-default disabled:opacity-30"
      style={{ background: s.ink, color: s.bg }}
    >
      {children}
    </button>
  )
}
