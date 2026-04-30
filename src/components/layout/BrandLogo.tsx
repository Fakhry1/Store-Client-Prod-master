interface BrandLogoProps {
  variant?: 'dark' | 'light'
  className?: string
}

export function BrandLogo({ variant = 'dark', className }: BrandLogoProps) {
  const c = variant === 'dark' ? '#0A1F44' : '#F5F2EC'

  return (
    <svg
      viewBox="0 0 720 200"
      width="720"
      height="200"
      aria-hidden="true"
      className={className}
      style={{ display: 'block', direction: 'ltr' }}
    >
      <g
        fontSize="180"
        fontWeight="600"
        letterSpacing="-8"
        style={{ fontFamily: "var(--font-space-grotesk, 'Trebuchet MS', system-ui, sans-serif)" }}
      >
        <text x="0"  y="160" fill={c}>I</text>
        <text x="60" y="160" fill={c}>N</text>

        <g transform="translate(330,100)">
          <circle r="78" fill="none" stroke={c} strokeWidth="22" />
          <circle
            r="78"
            fill="none"
            stroke="#FF6B2C"
            strokeWidth="22"
            strokeDasharray="60 1000"
            strokeDashoffset="-150"
            transform="rotate(-90)"
          />
          <circle r="10" fill="#FF6B2C" />
        </g>

        <text x="430" y="160" fill={c}>N</text>
        <text x="560" y="160" fill={c}>E</text>
      </g>
    </svg>
  )
}
