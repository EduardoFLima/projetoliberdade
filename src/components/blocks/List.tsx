export function List({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3 text-body-md text-on-surface">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
