'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// ─── constants ───────────────────────────────────────────────────────────────
const B   = 12   // ball radius
const PW  = 152  // paddle width
const PH  = 44   // paddle height
const PM  = 44   // paddle margin from top/bottom edge
const SP0 = 8    // initial ball speed (px/frame)

const GOAL_MS = 1100

type Phase = 'idle' | 'playing' | 'goal'

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v
}

/** Random launch angle: 50–130° so the ball is never too horizontal */
function launch(speed: number, upward: boolean) {
  const a = (Math.random() * 80 + 50) * (Math.PI / 180)
  const vx = Math.cos(a) * speed * (Math.random() < 0.5 ? 1 : -1)
  const vy = Math.sin(a) * speed * (upward ? -1 : 1)
  return { vx, vy }
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

  // All mutable game state lives here — avoids stale closures in the RAF loop
  const g = useRef({
    phase: 'idle' as Phase,
    bx: 0, by: 0, vx: 0, vy: 0,
    px: 0,          // player paddle center x
    cx: 0,          // comp   paddle center x
    pScore: 0, cScore: 0,
    speed: SP0,
    W: 0, H: 0,
    raf: 0, timer: 0,
  })

  // Direct DOM mutation — keeps animation off the React render cycle
  const paint = useCallback(() => {
    const { bx, by, px, cx, W, H } = g.current
    ballRef.current  && (ballRef.current.style.transform  = `translate(${bx - B}px,${by - B}px)`)
    playerRef.current && (playerRef.current.style.transform = `translate(${px - PW / 2}px,${H - PM - PH}px)`)
    compRef.current  && (compRef.current.style.transform  = `translate(${cx - PW / 2}px,${PM}px)`)
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
    s.by = s.H - PM - PH - B - 6   // ball rests just above player paddle
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

    // First serve: player side, ball goes upward
    s.bx = s.px; s.by = s.H - PM - PH - B - 6
    const lv = launch(s.speed, true)
    s.vx = lv.vx; s.vy = lv.vy

    s.phase = 'playing'
    setPhase('playing')
    paint()

    // ── goal handler ─────────────────────────────────────────────────────────
    function goal(by: 'player' | 'comp') {
      if (s.phase === 'goal') return
      cancelAnimationFrame(s.raf)
      s.phase = 'goal'

      if (by === 'player') { s.pScore++; setPs(s.pScore) }
      else                 { s.cScore++; setCs(s.cScore) }

      s.speed = SP0  // reseta a velocidade — o rally do próximo ponto começa do zero
      setScorer(by)
      setPhase('goal')

      s.timer = window.setTimeout(() => {
        // Serve from the side that was scored on
        if (by === 'player') {
          // player scored → comp serves from top, ball goes down
          s.bx = s.cx; s.by = PM + PH + B + 6
          const v = launch(s.speed, false); s.vx = v.vx; s.vy = v.vy
        } else {
          // comp scored → player serves from bottom, ball goes up
          s.bx = s.px; s.by = s.H - PM - PH - B - 6
          const v = launch(s.speed, true); s.vx = v.vx; s.vy = v.vy
        }
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

      // Wall bounce (left / right)
      if (s.bx - B <= 0)    { s.bx = B;       s.vx =  Math.abs(s.vx) }
      if (s.bx + B >= s.W)  { s.bx = s.W - B; s.vx = -Math.abs(s.vx) }

      // ── Player paddle (bottom) ─────────────────────────────────────────────
      const pyTop = s.H - PM - PH
      if (s.vy > 0
        && s.by + B >= pyTop && s.by - B <= pyTop + PH
        && Math.abs(s.bx - s.px) <= PW / 2 + B
      ) {
        s.by = pyTop - B
        s.speed *= 1.1                         // +10% a cada toque
        const hit = (s.bx - s.px) / (PW / 2)
        const maxVx = s.speed / Math.SQRT2     // 45° limit: |vx| ≤ |vy|
        s.vx = clamp(hit * s.speed * 0.9, -maxVx, maxVx)
        s.vy = -Math.sqrt(s.speed ** 2 - s.vx ** 2)
      }

      // ── Comp paddle (top) ──────────────────────────────────────────────────
      const cyBot = PM + PH
      if (s.vy < 0
        && s.by - B <= cyBot && s.by + B >= PM
        && Math.abs(s.bx - s.cx) <= PW / 2 + B
      ) {
        s.by = cyBot + B
        s.speed *= 1.1                         // +10% a cada toque
        const hit = (s.bx - s.cx) / (PW / 2)
        const maxVx = s.speed / Math.SQRT2     // 45° limit: |vx| ≤ |vy|
        s.vx = clamp(hit * s.speed * 0.9, -maxVx, maxVx)
        s.vy =  Math.sqrt(s.speed ** 2 - s.vx ** 2)
      }

      // ── Computer AI — rubber band ──────────────────────────────────────────
      // If player is 2+ ahead → comp speeds up and scores back
      // Otherwise comp trails slowly so the player stays ahead
      const diff = s.pScore - s.cScore
      const eff  = diff >= 2 ? 0.15 : diff >= 1 ? 0.10 : 0.07
      s.cx = clamp(s.cx + (s.bx - s.cx) * eff, PW / 2, s.W - PW / 2)
      s.px = clamp(s.px, PW / 2, s.W - PW / 2)

      // ── Goal detection ─────────────────────────────────────────────────────
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

  // ─── render ────────────────────────────────────────────────────────────────
  return (
    // z-[100] covers nav, footer and cookie banner
    <div className="fixed inset-0 z-[100] bg-white overflow-hidden select-none touch-none">
      <div ref={fieldRef} className="relative w-full h-full">

        {/* ── Computer paddle — Floux logo pill ── */}
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
                {'GOOOL'.split('').map((letter, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      animation: 'goal-wave 0.7s ease-in-out infinite',
                      animationDelay: `${i * 90}ms`,
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

        {/* ── Player paddle — PLAY / YOU ── */}
        <div
          ref={playerRef}
          className="absolute top-0 left-0 will-change-transform"
          style={{ width: PW, height: PH }}
        >
          {phase === 'idle' ? (
            <button
              onClick={startGame}
              className="w-full h-full bg-black rounded-full text-white text-[11px] font-medium tracking-[0.3em] uppercase hover:opacity-80 transition-opacity pointer-events-auto"
            >
              PLAY
            </button>
          ) : (
            <div className={`
              w-full h-full bg-black rounded-full flex items-center justify-center
              text-white text-[11px] font-medium tracking-[0.3em] uppercase
              transition-opacity duration-700
              ${phase === 'goal' && compScored ? 'opacity-20' : 'opacity-100'}
            `}>
              YOU
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
