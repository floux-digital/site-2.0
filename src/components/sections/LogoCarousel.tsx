import Image from 'next/image'

const logos = [
  { name: 'mmartan',   image: '/customers/mmartan.png'   }, 
  { name: 'Santander', image: '/customers/santander.png' },
  { name: 'Hauz',      image: '/customers/hauz.png'      },
  { name: 'Artex',     image: '/customers/artex.png'     },
  { name: 'Ajustador', image: '/customers/ajustador.png' },
  { name: 'Criobrás',  image: '/customers/criobras.png'  },
  { name: 'Runrun.it', image: '/customers/runrunit.png'  },
  { name: 'Zora',      image: '/customers/zora.png'      },
]

interface LogoCarouselProps {
  /** Duração de um ciclo completo em segundos. Padrão: 30. */
  speed?: number
  grayscale?: boolean
  opacity?: number
}

export default function LogoCarousel({ speed = 30, grayscale = false, opacity = 100 }: LogoCarouselProps) {
  const track = [...logos, ...logos]

  return (
    <div
      className="py-[88px] overflow-hidden"
      style={{ '--marquee-duration': `${speed}s` } as React.CSSProperties}
    >
      <div className="marquee-track flex items-center w-max">
        {track.map((logo, i) => (
          <div key={i} className="relative shrink-0 w-[140px] h-[48px] mr-16">
            <Image
              src={logo.image}
              alt={logo.name}
              fill
              sizes="140px"
              className={`object-contain opacity-${grayscale} ${grayscale ? "grayscale" : null}`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
