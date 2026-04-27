'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Componente de imagem com lazy load, skeleton e fallback de erro.
 *
 * CAMINHOS (Next.js):
 *   Arquivo em public/cases/foto.jpg  →  src="/cases/foto.jpg"  (sem /public)
 *   URLs externas também funcionam:      src="https://exemplo.com/foto.jpg"
 *
 * ORIENTAÇÃO:
 *   horizontal (padrão) — landscape no desktop (lg+), portrait no mobile
 *   vertical             — portrait em qualquer tamanho de tela
 *
 * EXEMPLOS:
 *   <FlImage src="/cases/capa.jpg" alt="Case Santander" />
 *   <FlImage src="/cases/foto.jpg" alt="Detalhe" orientation="vertical" />
 *
 * FILL — preenche o pai (pai deve ter position:relative e altura definida):
 *   <div className="relative h-[388px]">
 *     <FlImage src="/cases/foto.jpg" alt="Card" fill />
 *   </div>
 *
 * Sem src: exibe placeholder bg-card + console.error.
 */


type Props = {
  src?: string
  alt?: string
  orientation?: 'horizontal' | 'vertical'
  fill?: boolean
  className?: string
}

export default function FlImage({
  src,
  alt = '',
  orientation = 'horizontal',
  fill = false,
  className = '',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!src) return
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '400px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [src])

  useEffect(() => {
    if (!visible || !src) return
    const img = new Image()
    img.src = src
    img.onload = () => setLoaded(true)
    img.onerror = () => setError(true)
  }, [visible, src])

  if (!src) {
    console.error('[FlImage] src não fornecido.')
  }

  const aspectClass = fill
    ? ''
    : orientation === 'vertical'
      ? 'aspect-[1/1.618]'
      : 'aspect-[1/1.618] lg:aspect-[1.618/1]'

  const containerStyle: React.CSSProperties = fill
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%' }
    : { width: '100%' }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-3xl ${aspectClass} ${className}`}
      style={containerStyle}
    >
      {!src && (
        <div className="absolute inset-0 bg-card" />
      )}

      {src && !loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-card" />
      )}

      {src && visible && !error && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 500ms ease-in-out',
          }}
          role="img"
          aria-label={alt}
        />
      )}

      {src && error && (
        <div className="absolute inset-0 bg-card flex items-center justify-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-black/20"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      )}
    </div>
  )
}
