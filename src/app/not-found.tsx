'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'

// ─── constants ───────────────────────────────────────────────────────────────
const B   = 12   // ball radius
const PW  = 152  // goalkeeper width
const PH  = 44   // goalkeeper height
const PM  = 44   // goalkeeper margin from top/bottom edge
const SP0    = 8          // initial ball speed (px/frame)
const SP_MAX = SP0 + 2  // hard cap — speed can rise at most 0.5 above initial

const FIELD_PLAYER_COUNT = 2  // ← field players per team, change via code
const FPW = 38                // field player width
const FPH = 20                // field player height
const FP_DRIFT = FPW * 2     // max lateral drift from base x during play
const FP_SIDE  = FPW / 2 + 4 // min distance from side walls
const FP_GK_GAP = 28         // min vertical gap: goalkeeper → field player

const GOAL_MS = 1100

type Phase = 'idle' | 'playing' | 'goal'

interface FP {
  team: 'player' | 'comp'
  x: number      // current center x (drifts each frame)
  baseX: number  // assigned base x for this rally
  y: number      // center y (fixed per rally)
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v
}

function launch(speed: number, upward: boolean) {
  const a = (Math.random() * 80 + 50) * (Math.PI / 180)
  const vx = Math.cos(a) * speed * (Math.random() < 0.5 ? 1 : -1)
  const vy = Math.sin(a) * speed * (upward ? -1 : 1)
  return { vx, vy }
}

function spawnFPs(W: number, H: number): FP[] {
  const gkZ  = PM + PH
  const yMin = gkZ + FP_GK_GAP
  const yMax = H - gkZ - FP_GK_GAP
  const fps: FP[] = []

  if (yMax <= yMin || FIELD_PLAYER_COUNT <= 0) return fps

  // each team distributes players across the full field via slices so they
  // don't cluster — but any slice can be anywhere, including the opponent's half
  const sliceH = (yMax - yMin) / FIELD_PLAYER_COUNT

  for (const team of ['comp', 'player'] as const) {
    for (let i = 0; i < FIELD_PLAYER_COUNT; i++) {
      const yBase = yMin + i * sliceH
      const y = yBase + sliceH * 0.1 + Math.random() * sliceH * 0.8
      const x = FP_SIDE + Math.random() * (W - FP_SIDE * 2)
      fps.push({ team, x, baseX: x, y })
    }
  }

  return fps
}

// ─── component ───────────────────────────────────────────────────────────────
export default function NotFound() {
  const [phase,  setPhase]  = useState<Phase>('idle')
  const [ps,     setPs]     = useState(0)
  const [cs,     setCs]     = useState(0)
  const [scorer, setScorer] = useState<'player' | 'comp' | null>(null)

  const fieldRef  = useRef<HTMLDivElement>(null)
  const ballRef   = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const compRef   = useRef<HTMLDivElement>(null)
  const fpRefs    = useRef<(HTMLDivElement | null)[]>([])

  const g = useRef({
    phase: 'idle' as Phase,
    bx: 0, by: 0, vx: 0, vy: 0,
    px: 0, cx: 0,
    pScore: 0, cScore: 0,
    speed: SP0,
    W: 0, H: 0,
    raf: 0, timer: 0,
    fp: [] as FP[],
    fpCooldown: 0,  // frames until next FP collision is allowed
  })

  const paint = useCallback(() => {
    const { bx, by, px, cx, W, H, fp } = g.current
    if (ballRef.current)
      ballRef.current.style.transform   = `translate(${bx - B}px,${by - B}px)`
    if (playerRef.current)
      playerRef.current.style.transform = `translate(${px - PW / 2}px,${H - PM - PH}px)`
    if (compRef.current)
      compRef.current.style.transform   = `translate(${cx - PW / 2}px,${PM}px)`
    fp.forEach((p, i) => {
      const el = fpRefs.current[i]
      if (el) el.style.transform = `translate(${p.x - FPW / 2}px,${p.y - FPH / 2}px)`
    })
  }, [])

  // ── idle init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const f = fieldRef.current
    if (!f) return
    const s = g.current
    s.W = f.clientWidth
    s.H = f.clientHeight
    s.px = s.cx = s.W / 2
    s.bx = s.W / 2
    s.by = s.H - PM - PH - B - 6
    paint()
  }, [paint])

  // ── inputs + resize ────────────────────────────────────────────────────────
  useEffect(() => {
    const f = fieldRef.current
    if (!f) return
    const s = g.current

    const onMouse = (e: MouseEvent) => {
      if (s.phase !== 'playing') return
      s.px = e.clientX - f.getBoundingClientRect().left
    }
    const onTouch = (e: TouchEvent) => {
      if (s.phase !== 'playing') return
      e.preventDefault()
      s.px = e.touches[0].clientX - f.getBoundingClientRect().left
    }
    const onResize = () => { s.W = f.clientWidth; s.H = f.clientHeight }

    f.addEventListener('mousemove', onMouse)
    f.addEventListener('touchmove', onTouch, { passive: false })
    window.addEventListener('resize', onResize)
    return () => {
      f.removeEventListener('mousemove', onMouse)
      f.removeEventListener('touchmove', onTouch)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(s.raf)
      clearTimeout(s.timer)
    }
  }, [])

  // ── game start ─────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    const f = fieldRef.current
    if (!f) return
    const s = g.current
    cancelAnimationFrame(s.raf)
    clearTimeout(s.timer)

    s.W = f.clientWidth; s.H = f.clientHeight
    s.px = s.cx = s.W / 2
    s.pScore = s.cScore = 0
    s.speed  = SP0
    setPs(0); setCs(0); setScorer(null)

    s.fp = spawnFPs(s.W, s.H)
    s.fp.forEach((fp, i) => {
      const el = fpRefs.current[i]
      if (el) {
        el.style.transition = 'none'
        el.style.transform  = `translate(${fp.x - FPW / 2}px,${fp.y - FPH / 2}px)`
      }
    })

    s.bx = s.px; s.by = s.H - PM - PH - B - 6
    const lv = launch(s.speed, true)
    s.vx = lv.vx; s.vy = lv.vy

    s.phase = 'playing'
    setPhase('playing')
    paint()

    // ── goal handler ─────────────────────────────────────────────────────────
    function goal(scoredBy: 'player' | 'comp') {
      if (s.phase === 'goal') return
      cancelAnimationFrame(s.raf)
      s.phase = 'goal'

      if (scoredBy === 'player') { s.pScore++; setPs(s.pScore) }
      else                       { s.cScore++; setCs(s.cScore) }

      s.speed = SP0
      setScorer(scoredBy)
      setPhase('goal')

      // animate field players to new positions during the goal pause
      const newFPs = spawnFPs(s.W, s.H)
      newFPs.forEach((newFP, i) => {
        const el = fpRefs.current[i]
        if (el) {
          el.style.transition = 'transform 0.55s cubic-bezier(0.4,0,0.2,1)'
          el.style.transform  = `translate(${newFP.x - FPW / 2}px,${newFP.y - FPH / 2}px)`
        }
        s.fp[i] = newFP
      })

      s.timer = window.setTimeout(() => {
        fpRefs.current.forEach(el => { if (el) el.style.transition = 'none' })

        if (scoredBy === 'player') {
          s.bx = s.cx; s.by = PM + PH + B + 6
          const v = launch(s.speed, false); s.vx = v.vx; s.vy = v.vy
        } else {
          s.bx = s.px; s.by = s.H - PM - PH - B - 6
          const v = launch(s.speed, true); s.vx = v.vx; s.vy = v.vy
        }
        s.fpCooldown = 0
        s.phase = 'playing'
        setPhase('playing')
        setScorer(null)
        paint()
        s.raf = requestAnimationFrame(tick)
      }, GOAL_MS)
    }

    // ── game loop ─────────────────────────────────────────────────────────────
    function tick() {
      if (s.phase !== 'playing') return

      s.bx += s.vx
      s.by += s.vy

      // wall bounce
      if (s.bx - B <= 0)   { s.bx = B;       s.vx =  Math.abs(s.vx) }
      if (s.bx + B >= s.W) { s.bx = s.W - B; s.vx = -Math.abs(s.vx) }

      // ── field player drift (lateral only, clamped to base ± FP_DRIFT) ──────
      for (const fp of s.fp) {
        const tx = clamp(s.bx, fp.baseX - FP_DRIFT, fp.baseX + FP_DRIFT)
        fp.x += (tx - fp.x) * 0.04
        fp.x  = clamp(fp.x, FP_SIDE, s.W - FP_SIDE)
      }

      // ── field player collision ────────────────────────────────────────────
      if (s.fpCooldown > 0) s.fpCooldown--

      let deflected = false
      if (s.fpCooldown === 0) {
        for (const fp of s.fp) {
          if (deflected) break
          if (fp.team === 'player' && s.vy <= 0) continue
          if (fp.team === 'comp'   && s.vy >= 0) continue
          const dx = Math.abs(s.bx - fp.x)
          const dy = Math.abs(s.by - fp.y)
          if (dx <= FPW / 2 + B && dy <= FPH / 2 + B) {
            deflected = true
            s.fpCooldown = 10  // ~10 frames — enough for the ball to escape the FP hitbox
            const goUp  = fp.team === 'player'
            const hit   = clamp((s.bx - fp.x) / (FPW / 2), -1, 1)
            const maxVx = s.speed / Math.SQRT2
            // ensure enough horizontal component to escape the FP cluster
            const rawVx = hit * s.speed * 0.8 + (Math.random() - 0.5) * 2
            s.vx = clamp(
              Math.sign(rawVx || 1) * Math.max(Math.abs(rawVx), s.speed * 0.25),
              -maxVx, maxVx,
            )
            s.vy = (goUp ? -1 : 1) * Math.sqrt(s.speed ** 2 - s.vx ** 2)
            s.by = fp.y + (goUp ? -(FPH / 2 + B + 1) : FPH / 2 + B + 1)
          }
        }
      }

      if (!deflected) {
        // ── Player goalkeeper (bottom) ──────────────────────────────────────
        const pyTop = s.H - PM - PH
        if (s.vy > 0
          && s.by + B >= pyTop && s.by - B <= pyTop + PH
          && Math.abs(s.bx - s.px) <= PW / 2 + B
        ) {
          s.by = pyTop - B
          if (s.fpCooldown === 0) s.speed = Math.min(s.speed * 1.1, SP_MAX)
          const hit = (s.bx - s.px) / (PW / 2)
          const maxVx = s.speed / Math.SQRT2
          s.vx = clamp(hit * s.speed * 0.9, -maxVx, maxVx)
          s.vy = -Math.sqrt(s.speed ** 2 - s.vx ** 2)
        }

        // ── Comp goalkeeper (top) ───────────────────────────────────────────
        const cyBot = PM + PH
        if (s.vy < 0
          && s.by - B <= cyBot && s.by + B >= PM
          && Math.abs(s.bx - s.cx) <= PW / 2 + B
        ) {
          s.by = cyBot + B
          if (s.fpCooldown === 0) s.speed = Math.min(s.speed * 1.1, SP_MAX)
          const hit = (s.bx - s.cx) / (PW / 2)
          const maxVx = s.speed / Math.SQRT2
          s.vx = clamp(hit * s.speed * 0.9, -maxVx, maxVx)
          s.vy = Math.sqrt(s.speed ** 2 - s.vx ** 2)
        }
      }

      // ── Computer AI — rubber band ─────────────────────────────────────────
      const diff = s.pScore - s.cScore
      const eff  = diff >= 2 ? 0.15 : diff >= 1 ? 0.10 : 0.07
      s.cx = clamp(s.cx + (s.bx - s.cx) * eff, PW / 2, s.W - PW / 2)
      s.px = clamp(s.px, PW / 2, s.W - PW / 2)

      // ── goal detection ────────────────────────────────────────────────────
      if (s.by > s.H + 60) { goal('comp');   return }
      if (s.by < -60)       { goal('player'); return }

      paint()
      s.raf = requestAnimationFrame(tick)
    }

    s.raf = requestAnimationFrame(tick)
  }, [paint])

  // ── derived display state ─────────────────────────────────────────────────
  const playerScored = scorer === 'player'
  const compScored   = scorer === 'comp'
  const totalFPs     = FIELD_PLAYER_COUNT * 2

  // ─── render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-hidden select-none touch-none">
      <div ref={fieldRef} className="relative w-full h-full">

        {/* ── Comp goalkeeper — Floux logo pill ── */}
        <div
          ref={compRef}
          className="absolute top-0 left-0 will-change-transform"
          style={{ width: PW, height: PH }}
        >
          <div className={`
            w-full h-full bg-black rounded-full flex items-center justify-center
            transition-opacity duration-700
            ${phase === 'goal' && playerScored ? 'opacity-20' : 'opacity-100'}
          `}>
            <Image src="/floux-white.svg" alt="Floux" width={76} height={20} priority />
          </div>
        </div>

        {/* ── Field players (comp: solid black · player: outlined white) ── */}
        {Array.from({ length: totalFPs }, (_, i) => {
          const isComp = i < FIELD_PLAYER_COUNT
          return (
            <div
              key={i}
              ref={el => { fpRefs.current[i] = el }}
              className="absolute top-0 left-0 will-change-transform"
              style={{ width: FPW, height: FPH }}
            >
              <div className={[
                'w-full h-full rounded-full transition-opacity duration-300',
                isComp ? 'bg-black' : 'bg-white border-2 border-black',
                phase === 'idle' ? 'opacity-0' : 'opacity-100',
              ].join(' ')} />
            </div>
          )
        })}

        {/* ── Center text overlay ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

          {phase === 'idle' && (
            <div className="text-center">
              <p
                className="font-light leading-none text-black/[0.1]"
                style={{ fontSize: 'min(15vw, 10vh)' }}
              >
                404
              </p>
              <p className="uppercase text-black/[0.3]">
                A página não existe
              </p>
            </div>
          )}

          {phase === 'playing' && (
            <div className="flex items-center gap-5">
              <span className="text-[10px] tracking-[0.3em] uppercase text-muted">VOCÊ</span>
              <span
                className="font-light leading-none text-black/[0.06] tabular-nums"
                style={{ fontSize: 'min(15vw, 10vh)' }}
              >
                {ps}&nbsp;x&nbsp;{cs}
              </span>
              <span className="text-[10px] tracking-[0.3em] uppercase text-muted">FLOUX</span>
            </div>
          )}

          {phase === 'goal' && (
            <div className="flex items-center gap-4">
              <span className={`
                text-[10px] tracking-[0.3em] uppercase font-medium transition-colors duration-500
                ${playerScored ? 'text-black' : 'text-black/15'}
              `}>
                VOCÊ
              </span>
              <span className="flex items-end font-light leading-none text-black/[0.06]"
                style={{ fontSize: 'min(15vw, 10vh)' }}>
                {'GOOOL'.split('').map((letter, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-block',
                      animation: 'goal-wave 0.7s ease-in-out infinite',
                      animationDelay: `${idx * 90}ms`,
                    }}
                  >
                    {letter}
                  </span>
                ))}
              </span>
              <span className={`
                text-[10px] tracking-[0.3em] uppercase font-medium transition-colors duration-500
                ${compScored ? 'text-black' : 'text-black/15'}
              `}>
                FLOUX
              </span>
            </div>
          )}

        </div>

        {/* ── Ball ── */}
        <div
          ref={ballRef}
          className="absolute top-0 left-0 rounded-full bg-accent will-change-transform pointer-events-none"
          style={{ width: B * 2, height: B * 2 }}
        />

        {/* ── Player goalkeeper — PLAY / VOCÊ ── */}
        <div
          ref={playerRef}
          className="absolute top-0 left-0 will-change-transform"
          style={{ width: PW, height: PH }}
        >
          {phase === 'idle' ? (
            <button
              onClick={startGame}
              className="w-full h-full border border-black border-4 bg-white rounded-full text-black text-[11px] font-medium tracking-[0.3em] uppercase hover:opacity-80 transition-opacity pointer-events-auto"
            >
              PLAY
            </button>
          ) : (
            <div className={`
              w-full h-full bg-white rounded-full flex items-center justify-center
              text-black border-4 border-black text-[11px] font-medium tracking-[0.3em] uppercase
              transition-opacity duration-700
              ${phase === 'goal' && compScored ? 'opacity-20' : 'opacity-100'}
            `}>
              VOCÊ
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
