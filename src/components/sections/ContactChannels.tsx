import type { SocialLink } from '../../content/types'
import { Container } from '../ui/Container'
import { Section } from '../ui/Section'
import { ChatIcon, MailIcon, ShareIcon } from '../ui/icons'
import { SocialLinks } from '../SocialLinks'

interface WhatsApp {
  name: string
  number: string
  tel: string
  waHref: string
}

interface ContactChannelsProps {
  heading: string
  socialHeading: string
  whatsapps: WhatsApp[]
  email: string
  social: SocialLink[]
}

export function ContactChannels({
  heading,
  socialHeading,
  whatsapps,
  email,
  social,
}: ContactChannelsProps) {
  return (
    <Section tone="surface">
      <Container>
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div className="rounded-lg bg-secondary-fixed/30 p-6 shadow-level1">
            <h2 className="mb-4 flex items-center gap-2 font-display text-headline-sm text-on-surface">
              <ChatIcon className="h-6 w-6 text-primary" />
              {heading}
            </h2>
            <ul className="flex flex-col gap-4 text-body-md text-on-surface-variant">
              {whatsapps.map((wa) => (
                <li key={wa.tel} className="flex items-start gap-3">
                  <ChatIcon className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-label-md text-on-surface">
                      WhatsApp {wa.name}
                    </p>
                    <a
                      href={wa.waHref}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-primary"
                      aria-label={`WhatsApp ${wa.name} ${wa.number}`}
                    >
                      {wa.number}
                    </a>
                  </div>
                </li>
              ))}
              <li className="flex items-start gap-3">
                <MailIcon className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-label-md text-on-surface">E-mail</p>
                  <a href={`mailto:${email}`} className="hover:text-primary">
                    {email}
                  </a>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-lg bg-surface-container-low p-6 shadow-level1">
            <h2 className="mb-4 flex items-center gap-2 font-display text-headline-sm text-on-surface">
              <ShareIcon className="h-6 w-6 text-primary" />
              {socialHeading}
            </h2>
            <SocialLinks links={social} variant="buttons" />
          </div>
        </div>
      </Container>
    </Section>
  )
}
