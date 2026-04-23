const logos = [
  { name: 'Santander', text: 'Santander' },
  { name: 'ARTEX', text: 'ARTEX' },
  { name: 'HauzForYou', text: 'HauzForYou' },
  { name: 'Itaú', text: 'Itaú' },
  { name: 'Magalu', text: 'Magalu' },
  { name: 'B2W', text: 'B2W' },
]

export default function LogoCarousel() {
  const doubled = [...logos, ...logos]

  return (
    <div className="overflow-hidden py-8 border-y border-black/5">
      <div className="flex marquee-track whitespace-nowrap gap-16 items-center">
        {doubled.map((logo, i) => (
          <span
            key={i}
            className="inline-block text-[20px] font-medium text-muted opacity-60 shrink-0 px-8"
          >
            {logo.text}
          </span>
        ))}
      </div>
    </div>
  )
}
