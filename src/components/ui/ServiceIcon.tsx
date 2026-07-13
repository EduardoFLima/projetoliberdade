import { cn } from '../../lib/cn'

interface ServiceIconProps {
  icon: string
  index: number
  className?: string
}

const MATERIAL_PATHS: Record<string, string> = {
  pets: 'M169.86-485Q132-485 106-511.14t-26-64Q80-613 106.14-639t64-26Q208-665 234-638.86t26 64Q260-537 233.86-511t-64 26ZM291-681.14q-26-26.14-26-64T291.14-809q26.14-26 64-26T419-808.86q26 26.14 26 64T418.86-681q-26.14 26-64 26T291-681.14Zm250 0q-26-26.14-26-64T541.14-809q26.14-26 64-26T669-808.86q26 26.14 26 64T668.86-681q-26.14 26-64 26T541-681.14ZM789.86-485Q752-485 726-511.14t-26-64Q700-613 726.14-639t64-26Q828-665 854-638.86t26 64Q880-537 853.86-511t-64 26ZM266-75q-42 0-69-31.53-27-31.52-27-74.47 0-42 25.5-74.5T250-318q22-22 41-46.5t36-50.5q29-44 65-82t88-38q52 0 88.5 38t65.5 83q17 26 35.5 50t40.5 46q29 30 54.5 62.5T790-181q0 42.95-27 74.47Q736-75 694-75q-54 0-107-9t-107-9q-54 0-107 9t-107 9Z',
  pool: 'M80-120v-64q36-3 57.5-21t67.5-18q46 0 75 21.5t67 21.5q38 0 62.5-21.5T480-223q46 0 75 21.5t67 21.5q38 0 63-21.5t71-21.5q46 0 67 18t57 21v64q-35-3-60.5-22.5T756-162q-38 0-65 21t-69 21q-42 0-73-21t-69-21q-38 0-66.5 21T343-120q-42 0-71-21t-67-21q-38 0-64 19.5T80-120Zm0-188v-60q36-3 57.5-20.5T205-406q46 0 73 19t65 19q38 0 64.5-19t72.5-19q46 0 73 19t65 19q38 0 65-19t73-19q46 0 67 17.5t57 20.5v60q-35-3-60.5-22.5T756-350q-38 0-65 21t-69 21q-42 0-73-21t-69-21q-38 0-64.5 21T347-308q-42 0-73-21t-69-21q-38 0-64 19.5T80-308Zm208-208 135-135-54-54q-34-34-69-45.5T211-762v-79q72 0 118.5 18t90.5 62l253 253q-11 9-25.5 13t-29.5 4q-38 0-65.5-21T480-533q-45 0-72 21t-65 21q-18 0-32.5-7T288-516Zm447.5-293.5Q763-782 763-742t-27.5 67.5Q708-647 668-647t-67.5-27.5Q573-702 573-742t27.5-67.5Q628-837 668-837t67.5 27.5Z',
  psychology:
    'M240-80v-172q-57-52-88.5-121.5T120-520q0-150 105-255t255-105q125 0 221.5 73.5T827-615l55 218q4 14-5 25.5T853-360h-93v140q0 24.75-17.62 42.37Q724.75-160 700-160H600v80h-60v-140h160v-200h114l-45-180q-24-97-105-158.5T480-820q-125 0-212.5 86.5T180-522.46q0 64.42 26.32 122.39Q232.65-342.09 281-297l19 18v199h-60Zm257-370Zm-48 76h60l3-44q12-2 22.47-8.46Q544.94-432.92 553-441l42 14 28-48-30-24q5-14 5-29t-5-29l30-24-28-48-42 14q-8.33-7.69-19.17-13.85Q523-635 512-638l-3-44h-60l-3 44q-11 3-21.83 9.15Q413.33-622.69 405-615l-42-14-28 48 30 24q-5 14-5 29t5 29l-30 24 28 48 42-14q8.06 8.08 18.53 14.54Q434-420 446-418l3 44Zm-19.5-104.38q-20.5-20.38-20.5-49.5t20.38-49.62q20.38-20.5 49.5-20.5t49.62 20.38q20.5 20.38 20.5 49.5t-20.38 49.62q-20.38 20.5-49.5 20.5t-49.62-20.38Z',
}

const MASK_SRC: Record<string, string> = {
  'equine-therapy': '/icons/equine-therapy.mask.png',
  'classical-equitation': '/icons/classical-equitation.mask.png',
  'playful-riding': '/icons/playful-riding.mask.png',
  'adaptive-equitation': '/icons/adaptive-equitation.mask.png',
}

export function ServiceIcon({ icon, index, className }: ServiceIconProps) {
  const materialPath = MATERIAL_PATHS[icon]
  const maskSrc = MASK_SRC[icon]
  if (!materialPath && !maskSrc) return null

  const tone = index % 2 === 0 ? 'green' : 'purple'
  const toneClass =
    tone === 'green'
      ? 'bg-primary/10 text-primary'
      : 'bg-secondary/15 text-secondary'

  return (
    <span
      data-tone={tone}
      data-icon={icon}
      aria-hidden="true"
      className={cn(
        'inline-flex h-[3.6rem] w-[3.6rem] items-center justify-center rounded-full',
        toneClass,
        className,
      )}
    >
      {materialPath ? (
        <svg
          viewBox="0 -960 960 960"
          fill="currentColor"
          className="h-[1.8rem] w-[1.8rem]"
        >
          <path d={materialPath} />
        </svg>
      ) : (
        <span
          className="h-[2.4rem] w-[2.4rem] bg-current"
          style={{
            maskImage: `url(${maskSrc})`,
            WebkitMaskImage: `url(${maskSrc})`,
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
          }}
        />
      )}
    </span>
  )
}
