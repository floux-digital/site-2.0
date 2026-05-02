'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'

// ─── constants ───────────────────────────────────────────────────────────────
const B   = 12   // ball radius
const PW  = 152  // goalkeeper width
const PH  = 44   // goalkeeper height
const PM  = 44   // goalkeeper margin from top/bottom edge
const SP0    = 8        // initial ball speed (px/frame)
const SP_MAX = SP0 + 2  // hard cap on speed

const FIELD_PLAYER_COUNT = 2  // ← field players per team, change via code
const FPW = 38
const FPH = 20
const FP_DRIFT  = FPW * 2
const FP_SIDE   = FPW / 2 + 4
const FP_GK_GAP = 28

// ─── power-up constants ───────────────────────────────────────────────────────
const PU_W = 45, PU_H = 45   // circular pill — diameter
const PU_SPAWN = 300          // frames between spawns (~5 s at 60 fps)
// duration of each effect in frames (60 fps) — adjust freely
const PU_DUR_WIDE  = 600      // WIDE  — 10 s
const PU_DUR_MINI  = 600      // MINI  — 10 s
const PU_DUR_GHOST = 600      // GHOST — 10 s
const PU_DURATION  = { wide: PU_DUR_WIDE, mini: PU_DUR_MINI, ghost: PU_DUR_GHOST } as const
const PU_WIDE = 1.6           // goalkeeper width multiplier for WIDE

const GOAL_MS = 1100

type Phase  = 'idle' | 'playing' | 'goal'
type PUType = 'wide' | 'mini' | 'ghost'

interface FP {
  team: 'player' | 'comp'
  x: number; baseX: number; y: number
}

interface PowerUp {
  x: number; y: number
  type: PUType
  // team is resolved at collect time via lastTouched, not at spawn
}

interface Effect { type: PUType; frames: number }

// ─── module-level helpers ─────────────────────────────────────────────────────
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

function spawnPU(W: number, H: number): PowerUp {
  const types: PUType[] = ['wide', 'mini', 'ghost']
  const type = types[Math.floor(Math.random() * 3)]
  const gkZ  = PM + PH
  const yMin = gkZ + FP_GK_GAP + PU_H
  const yMax = H - gkZ - FP_GK_GAP - PU_H
  const y = yMin + Math.random() * (yMax - yMin)
  const x = PU_W / 2 + 20 + Math.random() * (W - PU_W - 40)
  return { x, y, type }
}

const PU_CFG: Record<PUType, { label: string; cls: string }> = {
  wide:  { label: 'WIDE',  cls: 'bg-violet-500 text-white' },
  mini:  { label: 'MINI',  cls: 'bg-rose-500 text-white'   },
  ghost: { label: 'GHOST', cls: 'bg-emerald-500 text-white' },
}

// ─── component ───────────────────────────────────────────────────────────────
export default function NotFound() {
  const [phase,   setPhase]   = useState<Phase>('idle')
  const [ps,      setPs]      = useState(0)
  const [cs,      setCs]      = useState(0)
  const [scorer,  setScorer]  = useState<'player' | 'comp' | null>(null)
  const [pu,      setPu]      = useState<PowerUp | null>(null)
  const [effectP, setEffectP] = useState<Effect | null>(null)
  const [effectC, setEffectC] = useState<Effect | null>(null)

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
    fpCooldown: 0,
    lastTouched: 'player' as 'player' | 'comp',
    pu: null as PowerUp | null,
    puTimer: PU_SPAWN,
    effectP: null as Effect | null,
    effectC: null as Effect | null,
    pPW: PW, pPH: PH,  // effective player goalkeeper dimensions
    cPW: PW, cPH: PH,  // effective comp goalkeeper dimensions
  })

  const paint = useCallback(() => {
    const { bx, by, px, cx, W, H, fp, pPW, pPH, cPW, cPH } = g.current
    if (ballRef.current)
      ballRef.current.style.transform = `translate(${bx - B}px,${by - B}px)`
    if (playerRef.current) {
      playerRef.current.style.width     = pPW + 'px'
      playerRef.current.style.height    = pPH + 'px'
      playerRef.current.style.transform = `translate(${px - pPW / 2}px,${H - PM - pPH}px)`
    }
    if (compRef.current) {
      compRef.current.style.width     = cPW + 'px'
      compRef.current.style.height    = cPH + 'px'
      compRef.current.style.transform = `translate(${cx - cPW / 2}px,${PM}px)`
    }
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
    s.W = f.clientWidth; s.H = f.clientHeight
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
    s.pu = null; s.puTimer = PU_SPAWN
    s.effectP = null; s.effectC = null
    s.pPW = PW; s.pPH = PH; s.cPW = PW; s.cPH = PH
    setPs(0); setCs(0); setScorer(null)
    setPu(null); setEffectP(null); setEffectC(null)

    s.fp = spawnFPs(s.W, s.H)
    s.fp.forEach((fp, i) => {
      const el = fpRefs.current[i]
      if (el) { el.style.transition = 'none'; el.style.transform = `translate(${fp.x - FPW / 2}px,${fp.y - FPH / 2}px)` }
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
      s.pu = null; s.puTimer = PU_SPAWN
      s.effectP = null; s.effectC = null
      s.pPW = PW; s.pPH = PH; s.cPW = PW; s.cPH = PH
      setPu(null); setEffectP(null); setEffectC(null)
      setScorer(scoredBy)
      setPhase('goal')

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

      // effect timers
      if (s.effectP) { s.effectP.frames--; if (s.effectP.frames <= 0) { s.effectP = null; setEffectP(null) } }
      if (s.effectC) { s.effectC.frames--; if (s.effectC.frames <= 0) { s.effectC = null; setEffectC(null) } }

      // effective goalkeeper dimensions (MINI shrinks to field-player size)
      s.pPW = s.effectP?.type === 'wide' ? Math.round(PW * PU_WIDE) : s.effectC?.type === 'mini' ? Math.round(PW * 0.5) : PW
      s.pPH = s.effectC?.type === 'mini' ? Math.round(PH * 0.5) : PH
      s.cPW = s.effectC?.type === 'wide' ? Math.round(PW * PU_WIDE) : s.effectP?.type === 'mini' ? Math.round(PW * 0.5) : PW
      s.cPH = s.effectP?.type === 'mini' ? Math.round(PH * 0.5) : PH

      // power-up spawn
      if (!s.pu) {
        s.puTimer--
        if (s.puTimer <= 0) {
          const newPu = spawnPU(s.W, s.H)
          s.pu = newPu
          setPu({ ...newPu })
        }
      }

      // ball movement
      s.bx += s.vx
      s.by += s.vy

      // wall bounce
      if (s.bx - B <= 0)   { s.bx = B;       s.vx =  Math.abs(s.vx) }
      if (s.bx + B >= s.W) { s.bx = s.W - B; s.vx = -Math.abs(s.vx) }

      // power-up collect (checked after ball moves)
      if (s.pu) {
        const dx = Math.abs(s.bx - s.pu.x)
        const dy = Math.abs(s.by - s.pu.y)
        if (dx <= PU_W / 2 + B && dy <= PU_H / 2 + B) {
          const ef: Effect = { type: s.pu.type, frames: PU_DURATION[s.pu.type] }
          // collector = whoever last touched the ball
          if (s.lastTouched === 'player') { s.effectP = ef; setEffectP({ ...ef }) }
          else                            { s.effectC = ef; setEffectC({ ...ef }) }
          s.pu = null; setPu(null)
          s.puTimer = PU_SPAWN
        }
      }

      // field player drift
      for (const fp of s.fp) {
        const tx = clamp(s.bx, fp.baseX - FP_DRIFT, fp.baseX + FP_DRIFT)
        fp.x += (tx - fp.x) * 0.04
        fp.x  = clamp(fp.x, FP_SIDE, s.W - FP_SIDE)
      }

      // field player collision
      if (s.fpCooldown > 0) s.fpCooldown--
      let deflected = false
      if (s.fpCooldown === 0) {
        for (const fp of s.fp) {
          if (deflected) break
          if (fp.team === 'player' && s.vy <= 0) continue
          if (fp.team === 'comp'   && s.vy >= 0) continue
          if (fp.team === 'comp'   && s.effectP?.type === 'ghost') continue
          if (fp.team === 'player' && s.effectC?.type === 'ghost') continue
          const dx = Math.abs(s.bx - fp.x)
          const dy = Math.abs(s.by - fp.y)
          if (dx <= FPW / 2 + B && dy <= FPH / 2 + B) {
            deflected = true
            s.fpCooldown = 10
            s.lastTouched = fp.team
            const goUp  = fp.team === 'player'
            const hit   = clamp((s.bx - fp.x) / (FPW / 2), -1, 1)
            const maxVx = s.speed / Math.SQRT2
            const rawVx = hit * s.speed * 0.8 + (Math.random() - 0.5) * 2
            s.vx = clamp(Math.sign(rawVx || 1) * Math.max(Math.abs(rawVx), s.speed * 0.25), -maxVx, maxVx)
            s.vy = (goUp ? -1 : 1) * Math.sqrt(s.speed ** 2 - s.vx ** 2)
            s.by = fp.y + (goUp ? -(FPH / 2 + B + 1) : FPH / 2 + B + 1)
          }
        }
      }

      if (!deflected) {
        // player goalkeeper (bottom)
        const pyTop = s.H - PM - s.pPH
        if (s.vy > 0
          && s.by + B >= pyTop && s.by - B <= pyTop + s.pPH
          && Math.abs(s.bx - s.px) <= s.pPW / 2 + B
        ) {
          s.by = pyTop - B
          s.lastTouched = 'player'
          if (s.fpCooldown === 0) s.speed = Math.min(s.speed * 1.1, SP_MAX)
          const hit = (s.bx - s.px) / (s.pPW / 2)
          const maxVx = s.speed / Math.SQRT2
          s.vx = clamp(hit * s.speed * 0.9, -maxVx, maxVx)
          s.vy = -Math.sqrt(s.speed ** 2 - s.vx ** 2)
        }

        // comp goalkeeper (top)
        const cyBot = PM + s.cPH
        if (s.vy < 0
          && s.by - B <= cyBot && s.by + B >= PM
          && Math.abs(s.bx - s.cx) <= s.cPW / 2 + B
        ) {
          s.by = cyBot + B
          s.lastTouched = 'comp'
          if (s.fpCooldown === 0) s.speed = Math.min(s.speed * 1.1, SP_MAX)
          const hit = (s.bx - s.cx) / (s.cPW / 2)
          const maxVx = s.speed / Math.SQRT2
          s.vx = clamp(hit * s.speed * 0.9, -maxVx, maxVx)
          s.vy = Math.sqrt(s.speed ** 2 - s.vx ** 2)
        }
      }

      // comp AI
      const diff = s.pScore - s.cScore
      const eff  = diff >= 2 ? 0.15 : diff >= 1 ? 0.10 : 0.07
      s.cx = clamp(s.cx + (s.bx - s.cx) * eff, s.cPW / 2, s.W - s.cPW / 2)
      s.px = clamp(s.px, s.pPW / 2, s.W - s.pPW / 2)

      // goal detection
      if (s.by > s.H + 60) { goal('comp');   return }
      if (s.by < -60)       { goal('player'); return }

      paint()
      s.raf = requestAnimationFrame(tick)
    }

    s.raf = requestAnimationFrame(tick)
  }, [paint])

  const playerScored = scorer === 'player'
  const compScored   = scorer === 'comp'
  const totalFPs     = FIELD_PLAYER_COUNT * 2

  // ─── render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-hidden select-none touch-none">
      <div ref={fieldRef} className="relative w-full h-full">

        {/* ── Comp goalkeeper ── */}
        <div ref={compRef} className="absolute top-0 left-0 will-change-transform"
          style={{ width: PW, height: PH, transition: 'width 0.35s ease, height 0.35s ease' }}>
          <div className={`w-full h-full bg-black rounded-full flex items-center justify-center transition-opacity duration-700 ${phase === 'goal' && playerScored ? 'opacity-20' : 'opacity-100'}`}>
            {phase === 'idle' ? (
              <Image src="/floux-white.svg" alt="Floux" width={76} height={20} priority />
            ) : (
              <span className="text-white text-[11px] font-light tracking-[0.2em]">FLOUX</span>
            )}
          </div>
        </div>

        {/* ── Field players (comp: solid · player: outlined) ── */}
        {Array.from({ length: totalFPs }, (_, i) => {
          const isComp  = i < FIELD_PLAYER_COUNT
          const fpTeam  = isComp ? 'comp' : 'player'
          const ghosted = (fpTeam === 'comp'   && effectP?.type === 'ghost')
                       || (fpTeam === 'player' && effectC?.type === 'ghost')
          return (
            <div key={i} ref={el => { fpRefs.current[i] = el }}
              className="absolute top-0 left-0 will-change-transform"
              style={{ width: FPW, height: FPH }}
            >
              <div
                className={['w-full h-full rounded-full', isComp ? 'bg-black' : 'bg-white border-2 border-black'].join(' ')}
                style={{ opacity: phase === 'idle' ? 0 : ghosted ? 0.18 : 1, transition: 'opacity 0.8s ease' }}
              />
            </div>
          )
        })}

        {/* ── Power-up ── */}
        {pu && (
          <div
            className="absolute pointer-events-none animate-pulse"
            style={{ left: pu.x - PU_W / 2, top: pu.y - PU_H / 2, width: PU_W, height: PU_H }}
          >
            <div className={`w-full h-full rounded-full flex items-center justify-center ${PU_CFG[pu.type].cls}`}>
              <span className="text-[8px] font-semibold tracking-[0.12em]">
                {PU_CFG[pu.type].label}
              </span>
            </div>
          </div>
        )}

        {/* ── Active effect badges ── */}
        {(effectP || effectC) && phase === 'playing' && (
          <div className="absolute inset-x-0 bottom-14 flex justify-center gap-2 pointer-events-none">
            {effectP && (
              <span className={`text-[8px] font-semibold tracking-[0.12em] px-2 py-0.5 rounded-full ${PU_CFG[effectP.type].cls} opacity-70`}>
                {PU_CFG[effectP.type].label}
              </span>
            )}
            {effectC && (
              <span className={`text-[8px] font-semibold tracking-[0.12em] px-2 py-0.5 rounded-full ${PU_CFG[effectC.type].cls} opacity-70`}>
                {PU_CFG[effectC.type].label}
              </span>
            )}
          </div>
        )}

        {/* ── Center text overlay ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {phase === 'idle' && (
            <div className="text-center">
              <p className="font-light leading-none text-black/[0.1]" style={{ fontSize: 'min(15vw, 10vh)' }}>404</p>
              <p className="uppercase text-black/[0.3]">A página não existe</p>
            </div>
          )}
          {phase === 'playing' && (
            <div className="flex items-center gap-5">
              <span className="text-[10px] tracking-[0.3em] uppercase text-muted">VOCÊ</span>
              <span className="font-light leading-none text-black/[0.06] tabular-nums" style={{ fontSize: 'min(15vw, 10vh)' }}>
                {ps}&nbsp;x&nbsp;{cs}
              </span>
              <span className="text-[10px] tracking-[0.3em] uppercase text-muted">FLOUX</span>
            </div>
          )}
          {phase === 'goal' && (
            <div className="flex items-center gap-4">
              <span className={`text-[10px] tracking-[0.3em] uppercase font-medium transition-colors duration-500 ${playerScored ? 'text-black' : 'text-black/15'}`}>VOCÊ</span>
              <span className="flex items-end font-light leading-none text-black/[0.06]" style={{ fontSize: 'min(15vw, 10vh)' }}>
                {'GOOOL'.split('').map((letter, idx) => (
                  <span key={idx} style={{ display: 'inline-block', animation: 'goal-wave 0.7s ease-in-out infinite', animationDelay: `${idx * 90}ms` }}>{letter}</span>
                ))}
              </span>
              <span className={`text-[10px] tracking-[0.3em] uppercase font-medium transition-colors duration-500 ${compScored ? 'text-black' : 'text-black/15'}`}>FLOUX</span>
            </div>
          )}
        </div>

        {/* ── Ball ── */}
        <div ref={ballRef}
          className="absolute top-0 left-0 rounded-full bg-accent will-change-transform pointer-events-none"
          style={{ width: B * 2, height: B * 2 }}
        />

        {/* ── Player goalkeeper ── */}
        <div ref={playerRef} className="absolute top-0 left-0 will-change-transform"
          style={{ width: PW, height: PH, transition: 'width 0.35s ease, height 0.35s ease' }}>
          {phase === 'idle' ? (
            <button onClick={startGame}
              className="w-full h-full bg-black rounded-full text-white text-[11px] font-medium tracking-[0.3em] uppercase hover:opacity-80 transition-opacity pointer-events-auto">
              PLAY
            </button>
          ) : (
            <div className={`w-full h-full bg-black rounded-full flex items-center justify-center text-white text-[11px] font-medium tracking-[0.3em] uppercase transition-opacity duration-700 ${phase === 'goal' && compScored ? 'opacity-20' : 'opacity-100'}`}>
              VOCÊ
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
