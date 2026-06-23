const FIREBASE_STORAGE_BASE = 'https://firebasestorage.googleapis.com/v0/b/projetoliberdade-afe28.appspot.com/o/'

function getImageUrl(path) {
  return `${FIREBASE_STORAGE_BASE}${encodeURIComponent(path)}?alt=media`
}

export default function Hippussuit({ data }) {
  if (!data?.hippussuit) return null

  const { hippussuit } = data
  const sections = Object.entries(hippussuit)
    .filter(([key]) => key.startsWith('p'))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => ({
      text: value.txts?.txt || '',
      imageLeft: value.img_esq?.src || null,
      imageRight: value.img_dir?.src || null,
    }))

  return (
    <section id="hippussuit" className="py-(--spacing-section) px-4 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 text-center mb-12 font-[var(--font-heading)]">
          {hippussuit.titulo || 'Hippussuit'}
        </h2>
        <div className="space-y-12">
          {sections.map((section, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              } items-center gap-8`}
            >
              {(section.imageLeft || section.imageRight) && (
                <div className="w-full md:w-1/3 flex-shrink-0">
                  <img
                    src={getImageUrl(section.imageLeft || section.imageRight)}
                    alt=""
                    className="w-full rounded-[var(--radius-card)] shadow-[var(--shadow-card)] object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="text-neutral-600 leading-relaxed text-lg">
                  {section.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
