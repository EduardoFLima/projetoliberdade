import { describe, expect, it } from 'vitest'
import { contentRepository } from '../../content/content'
import {
  selectContactChannels,
  selectContatoHero,
  selectUnits,
} from './contatoSelectors'

describe('contato selectors (real content.json)', () => {
  it('selectContatoHero returns the hero title and subtitle', async () => {
    const content = await contentRepository.getContent()
    const hero = selectContatoHero(content)
    expect(hero.title).toBe('Entre em Contato')
    expect(hero.subtitle).toContain('Estamos aqui para ajudar')
  })

  it('selectContactChannels maps whatsapp phones and email', async () => {
    const content = await contentRepository.getContent()
    const channels = selectContactChannels(content)
    expect(channels.heading).toBe('Fale Conosco')
    expect(channels.socialHeading).toBe('Redes Sociais')
    expect(channels.email).toBe('contato@projetoliberdade.com.br')
    expect(channels.whatsapps).toEqual([
      {
        name: 'Karina',
        number: '(11) 94191-7707',
        tel: '+5511941917707',
        waHref: 'https://wa.me/5511941917707',
      },
      {
        name: 'André',
        number: '(11) 95059-6727',
        tel: '+5511950596727',
        waHref: 'https://wa.me/5511950596727',
      },
    ])
  })

  it('selectUnits builds address lines and keyless map URLs', async () => {
    const content = await contentRepository.getContent()
    const { heading, subtitle, units } = selectUnits(content)
    expect(heading).toBe('Nossas Unidades')
    expect(subtitle).toContain('mais próximo')
    expect(units).toHaveLength(2)

    const serra = units[0]
    expect(serra.slug).toBe('serra')
    expect(serra.label).toBe('Unidade 1 - Serra')
    expect(serra.venue).toBe('Haras Liberdade - Serra')
    expect(serra.addressLines).toEqual([
      'R. Flôr da Penha, 916',
      'Bela Vista',
      'Mairiporã - SP',
    ])
    expect(serra.mapEmbedSrc).toBe(
      'https://www.google.com/maps?q=Projeto%20Liberdade%20Reabilita%C3%A7%C3%A3o%20e%20Equoterapia&output=embed',
    )
    expect(serra.mapLinkHref).toBe(
      'https://www.google.com/maps/search/?api=1&query=Projeto%20Liberdade%20Reabilita%C3%A7%C3%A3o%20e%20Equoterapia',
    )

    const sp = units[1]
    expect(sp.slug).toBe('sao-paulo')
    expect(sp.venue).toBeUndefined()
    expect(sp.mapEmbedSrc).toBe(
      'https://www.google.com/maps?q=-23.458892%2C-46.615464&output=embed',
    )
  })
})
