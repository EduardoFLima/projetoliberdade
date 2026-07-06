import type { ReactNode } from 'react'

interface IconProps {
  className?: string
}

function Svg({
  className,
  children,
  fill = 'none',
}: IconProps & { children: ReactNode; fill?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill={fill}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  )
}

export function FlagIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 22V4" />
      <path d="M4 4h13l-2 4 2 4H4" />
    </Svg>
  )
}

export function VisibilityIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  )
}

export function FavoriteIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 21s-7-4.6-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9Z" />
    </Svg>
  )
}

export function ArrowForwardIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Svg>
  )
}

export function ChatIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6.5A8 8 0 1 1 21 12Z" />
    </Svg>
  )
}

export function MenuIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </Svg>
  )
}

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </Svg>
  )
}

export function MailIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Svg>
  )
}

export function ShareIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </Svg>
  )
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Svg>
  )
}

export function MapIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </Svg>
  )
}

function ServiceSvg({
  className,
  dataIcon,
  children,
}: IconProps & { dataIcon: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      data-icon={dataIcon}
      className={className}
    >
      {children}
    </svg>
  )
}

export function HorseTherapyIcon({ className }: IconProps) {
  return (
    <ServiceSvg className={className} dataIcon="horse-therapy">
      <path d="M5 21c-1-4 1-7 4-8l1-3 3-1 2 2 3 1-1 3c1 2 1 4 0 6" />
      <path d="M9 8.5h.01" />
      <path d="M14.5 14c1 1.5 1 3.5-.5 4.5s-3.5.5-4.5-1" />
    </ServiceSvg>
  )
}

export function RidingHelmetIcon({ className }: IconProps) {
  return (
    <ServiceSvg className={className} dataIcon="riding-helmet">
      <path d="M3 14a9 9 0 0 1 18 0" />
      <path d="M21 14a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3" />
      <path d="M12 5v3" />
      <path d="M6 17v2h12v-2" />
    </ServiceSvg>
  )
}

export function HorseshoeIcon({ className }: IconProps) {
  return (
    <ServiceSvg className={className} dataIcon="horseshoe">
      <path d="M7 21c-2-1-3-4-3-8a8 8 0 0 1 16 0c0 4-1 7-3 8" />
      <path d="M7 21v-2M17 21v-2M8.5 18.5h.01M15.5 18.5h.01" />
    </ServiceSvg>
  )
}

export function AdaptedRidingIcon({ className }: IconProps) {
  return (
    <ServiceSvg className={className} dataIcon="adapted-riding">
      <path d="M6 20c-1.5-1-2.5-3.5-2.5-6.5A7.5 7.5 0 0 1 16 8" />
      <circle cx="17" cy="7" r="1.5" />
      <path d="M14 11h5l-1.5 4M15.5 15l-1.5 5M18 15l1.5 4" />
    </ServiceSvg>
  )
}

export function PawIcon({ className }: IconProps) {
  return (
    <ServiceSvg className={className} dataIcon="paw">
      <circle cx="7" cy="9" r="1.6" />
      <circle cx="12" cy="6.5" r="1.6" />
      <circle cx="17" cy="9" r="1.6" />
      <path d="M12 12c-2.6 0-4.5 2-4.5 4 0 1.7 1.4 2.5 4.5 2.5s4.5-.8 4.5-2.5c0-2-1.9-4-4.5-4Z" />
    </ServiceSvg>
  )
}

export function SwimmerIcon({ className }: IconProps) {
  return (
    <ServiceSvg className={className} dataIcon="swimmer">
      <circle cx="17" cy="7" r="1.6" />
      <path d="m5 12 4-2 3 2 3-1.5" />
      <path d="M2 17c1.2 1 2.3 1 3.5 0s2.3-1 3.5 0 2.3 1 3.5 0 2.3-1 3.5 0 2.3 1 3.5 0" />
      <path d="M2 20.5c1.2 1 2.3 1 3.5 0s2.3-1 3.5 0s2.3 1 3.5 0 2.3-1 3.5 0 2.3 1 3.5 0" />
    </ServiceSvg>
  )
}

export function NeuroIcon({ className }: IconProps) {
  return (
    <ServiceSvg className={className} dataIcon="neuro">
      <path d="M15 4a5 5 0 0 1 2 9v3a2 2 0 0 1-2 2h-1v2" />
      <path d="M9.5 4A5 5 0 0 0 7 13" />
      <path d="M9.5 4a3 3 0 0 1 5.5 0" />
      <path d="M3 12h2l1.5-2 2 4 1.5-2h2" />
    </ServiceSvg>
  )
}

export function ServiceDefaultIcon({ className }: IconProps) {
  return (
    <ServiceSvg className={className} dataIcon="default">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <circle cx="12" cy="12" r="3" />
    </ServiceSvg>
  )
}

const serviceIcons: Record<string, (props: IconProps) => ReactNode> = {
  'horse-therapy': HorseTherapyIcon,
  'riding-helmet': RidingHelmetIcon,
  horseshoe: HorseshoeIcon,
  'adapted-riding': AdaptedRidingIcon,
  paw: PawIcon,
  swimmer: SwimmerIcon,
  neuro: NeuroIcon,
}

export function ServiceIcon({
  name,
  className,
}: {
  name?: string
  className?: string
}) {
  const Icon = (name && serviceIcons[name]) || ServiceDefaultIcon
  return <Icon className={className} />
}
