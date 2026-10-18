import Image from 'next/image'

export function BrandLogo({
  className,
  priority = false,
  size = 24,
}: {
  className?: string
  priority?: boolean
  size?: number
}) {
  const classes = ['brand-logo', className].filter(Boolean).join(' ')

  return (
    <span aria-hidden="true" className={classes} style={{ height: size, width: size }}>
      <Image
        alt=""
        className="brand-logo-light"
        height={size}
        priority={priority}
        src="/zenoLogo.svg"
        width={size}
      />
      <Image
        alt=""
        className="brand-logo-dark"
        height={size}
        priority={priority}
        src="/zenoLogo-dark.svg"
        width={size}
      />
    </span>
  )
}
