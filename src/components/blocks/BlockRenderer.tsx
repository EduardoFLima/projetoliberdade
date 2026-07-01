import type { Block } from '../../content/types'
import { Paragraph } from './Paragraph'
import { Heading } from './Heading'
import { List } from './List'
import { ImageBlock } from './Image'
import { Quote } from './Quote'

function BlockItem({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return <Paragraph text={block.text} />
    case 'heading':
      return <Heading text={block.text} level={block.level} />
    case 'list':
      return <List items={block.items} />
    case 'image':
      return <ImageBlock src={block.src} alt={block.alt} />
    case 'quote':
      return <Quote text={block.text} author={block.author} />
    default:
      return assertNever(block)
  }
}

function assertNever(block: never): never {
  throw new Error(`Unknown block type: ${JSON.stringify(block)}`)
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, i) => (
        <BlockItem key={i} block={block} />
      ))}
    </div>
  )
}
