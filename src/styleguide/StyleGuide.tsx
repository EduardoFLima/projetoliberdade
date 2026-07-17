import type { Block, Photo, Video } from '../content/types'
import { Container } from '../components/ui/Container'
import { Section } from '../components/ui/Section'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { Card } from '../components/ui/Card'
import { ServiceIcon } from '../components/ui/ServiceIcon'
import { BlockRenderer } from '../components/blocks/BlockRenderer'
import { PhotoGallery } from '../components/sections/PhotoGallery'
import { VideoEmbed } from '../components/VideoEmbed'
import { pageMeta } from '../lib/meta'

export function meta() {
  return pageMeta('Guia de Estilo — Projeto Liberdade')
}

const swatches = [
  'bg-primary',
  'bg-primary-container',
  'bg-secondary',
  'bg-surface-container',
  'bg-error',
]

const serviceIcons = [
  ['equine-therapy', 'Equoterapia'],
  ['classical-equitation', 'Equitação Clássica'],
  ['playful-riding', 'Equitação Lúdica'],
  ['adaptive-equitation', 'Equitação Adaptada'],
  ['pets', 'Pet Terapia'],
  ['pool', 'Hidroterapia'],
  ['psychology', 'Reabilitação Neurofuncional'],
]

const typeScale = [
  ['text-display-lg', 'Display Large'],
  ['text-headline-md', 'Headline Medium'],
  ['text-headline-sm', 'Headline Small'],
  ['text-body-lg', 'Body Large'],
  ['text-body-md', 'Body Medium'],
  ['text-label-md', 'Label Medium'],
  ['text-label-sm', 'Label Small'],
]

const sampleBlocks: Block[] = [
  { type: 'heading', text: 'Bloco de exemplo' },
  { type: 'paragraph', text: 'Parágrafo de demonstração do BlockRenderer.' },
  { type: 'list', items: ['Item um', 'Item dois'] },
  { type: 'quote', text: 'Uma citação de exemplo.', author: 'Autor' },
]

const samplePhotos: Photo[] = [
  { src: 'https://placehold.co/800', alt: 'Foto de exemplo em destaque' },
  { src: 'https://placehold.co/400', alt: 'Foto de exemplo 1' },
  { src: 'https://placehold.co/400?text=2', alt: 'Foto de exemplo 2' },
]

const sampleVideo: Video = {
  slug: 'demo',
  title: 'Vídeo de exemplo',
  order: 1,
  url: 'https://www.youtube.com/embed/RcaxtQWPI_c',
}

export function StyleGuide() {
  return (
    <Container className="py-12">
      <h1 className="font-display text-display-lg text-on-surface">Estilo</h1>

      <Section className="mt-8">
        <h2 className="font-display text-headline-md">Ícones de serviço</h2>
        <div className="mt-4 flex flex-wrap gap-6">
          {serviceIcons.map(([icon, label], i) => (
            <div key={icon} className="flex w-28 flex-col items-center gap-2">
              <ServiceIcon icon={icon} index={i} />
              <span className="text-center text-label-sm text-on-surface-variant">
                {label}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section className="mt-8">
        <h2 className="font-display text-headline-md">Cores</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {swatches.map((c) => (
            <div key={c} className={`h-16 w-16 rounded-lg ${c}`} title={c} />
          ))}
        </div>
      </Section>

      <Section className="mt-8">
        <h2 className="font-display text-headline-md">Tipografia</h2>
        {typeScale.map(([cls, label]) => (
          <p key={cls} className={`font-display ${cls}`}>
            {label}
          </p>
        ))}
      </Section>

      <Section className="mt-8">
        <h2 className="font-display text-headline-md">Botões e chips</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button>Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button compact>Compacto</Button>
          <Chip>Categoria</Chip>
          <Chip tone="secondary">Info</Chip>
        </div>
      </Section>

      <Section className="mt-8">
        <h2 className="font-display text-headline-md">Card + blocos</h2>
        <Card className="mt-4">
          <BlockRenderer blocks={sampleBlocks} />
        </Card>
      </Section>

      <Section className="mt-8">
        <h2 className="font-display text-headline-md">Galeria</h2>
        <div className="mt-4">
          <PhotoGallery photos={samplePhotos} />
        </div>
      </Section>

      <Section className="mt-8">
        <h2 className="font-display text-headline-md">Vídeo</h2>
        <div className="mt-4 max-w-xl">
          <VideoEmbed video={sampleVideo} />
        </div>
      </Section>
    </Container>
  )
}

export default StyleGuide
