'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [playing, setPlaying] = useState(false)
  const animRef = useRef<number | null>(null)

  useEffect(() => {
    if (!playing) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const W = canvas.width
    const H = canvas.height

    const state = {
      ball: { x: W / 2, y: H / 2, vx: 3, vy: -3, r: 8 },
      paddles: [
        { x: 16, y: H / 2 - 40, w: 10, h: 80, vy: 0 },
        { x: W - 26, y: H / 2 - 40, w: 10, h: 80, vy: 0 },
      ],
      score: [0, 0],
    }

    const keys = new Set<string>()
    const onKey = (e: KeyboardEvent) => {
      if (e.type === 'keydown') keys.add(e.key)
      else keys.delete(e.key)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)

    function loop() {
      if (!ctx || !canvas) return

      // Move player 1 (W/S) and player 2 (↑/↓)
      if (keys.has('w') || keys.has('W')) state.paddles[0].y -= 4
      if (keys.has('s') || keys.has('S')) state.paddles[0].y += 4
      if (keys.has('ArrowUp')) state.paddles[1].y -= 4
      if (keys.has('ArrowDown')) state.paddles[1].y += 4

      // Clamp paddles
      state.paddles.forEach((p) => {
        p.y = Math.max(0, Math.min(H - p.h, p.y))
      })

      // Move ball
      const b = state.ball
      b.x += b.vx
      b.y += b.vy

      // Bounce top/bottom
      if (b.y - b.r <= 0 || b.y + b.r >= H) b.vy *= -1

      // Bounce off paddles
      state.paddles.forEach((p) => {
        if (
          b.x - b.r <= p.x + p.w &&
          b.x + b.r >= p.x &&
          b.y >= p.y &&
          b.y <= p.y + p.h
        ) {
          b.vx *= -1.05
          b.vy += (Math.random() - 0.5) * 1.5
          b.vx = Math.max(-10, Math.min(10, b.vx))
          b.vy = Math.max(-8, Math.min(8, b.vy))
        }
      })

      // Score
      if (b.x < 0) {
        state.score[1]++
        b.x = W / 2
        b.y = H / 2
        b.vx = 3
        b.vy = (Math.random() - 0.5) * 4
      }
      if (b.x > W) {
        state.score[0]++
        b.x = W / 2
        b.y = H / 2
        b.vx = -3
        b.vy = (Math.random() - 0.5) * 4
      }

      // Draw
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, W, H)

      // Center dashed line
      ctx.setLineDash([8, 8])
      ctx.strokeStyle = 'rgba(0,0,0,0.08)'
      ctx.beginPath()
      ctx.moveTo(W / 2, 0)
      ctx.lineTo(W / 2, H)
      ctx.stroke()
      ctx.setLineDash([])

      // Paddles
      ctx.fillStyle = '#000000'
      state.paddles.forEach((p) => {
        ctx.beginPath()
        ctx.roundRect(p.x, p.y, p.w, p.h, 5)
        ctx.fill()
      })

      // Ball (accent color)
      ctx.fillStyle = '#00ffb2'
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fill()

      // Score
      ctx.fillStyle = 'rgba(0,0,0,0.15)'
      ctx.font = '400 48px Poppins, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(String(state.score[0]), W / 2 - 60, 60)
      ctx.fillText(String(state.score[1]), W / 2 + 60, 60)

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKey)
    }
  }, [playing])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
      {/* Logo pill at top */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <div className="bg-black rounded-full px-6 py-3">
          <Image src="/floux-white.svg" alt="Floux" width={90} height={37} />
        </div>
      </div>

      {!playing ? (
        /* ── Idle state ── */
        <div className="flex flex-col items-center gap-6 text-center">
          <p
            className="text-[8rem] lg:text-display font-light text-[#e5e5e5] leading-display tracking-display select-none"
            aria-hidden="true"
          >
            404
          </p>
          <p className="text-[16px] font-medium text-[#cecece] tracking-widest uppercase">
            A página não existe
          </p>

          {/* Ball hint */}
          <div className="w-6 h-6 rounded-full bg-accent animate-bounce mt-4" />

          <button
            onClick={() => setPlaying(true)}
            className="mt-4 bg-black text-white font-medium text-[20px] px-8 py-3 rounded-full hover:opacity-80 transition-opacity"
          >
            PLAY
          </button>
        </div>
      ) : (
        /* ── Game state ── */
        <div className="w-full h-full flex flex-col">
          <canvas ref={canvasRef} className="flex-1 w-full" />
          <div className="text-center py-3 text-[13px] text-muted">
            J1: W/S &nbsp;|&nbsp; J2: ↑/↓
            &nbsp;&nbsp;
            <Link href="/" className="underline hover:text-black">
              Voltar ao início
            </Link>
          </div>
        </div>
      )}

      {!playing && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <Link
            href="/"
            className="text-[14px] font-light text-muted hover:text-black transition-colors"
          >
            ← Voltar ao início
          </Link>
        </div>
      )}
    </div>
  )
}
