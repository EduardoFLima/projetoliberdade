import SectionHeading from './SectionHeading'

function UnitCard({ unit }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    unit.mapa?.searchParameter || `${unit.localidade}, ${unit.cidade}`
  )}`

  return (
    <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-1">{unit.nome}</h3>
      <p className="text-sm text-primary-600 font-medium mb-3">{unit.subtitulo}</p>
      <address className="not-italic text-neutral-600 text-sm space-y-1 mb-4">
        <p>{unit.localidade}</p>
        <p>{unit.bairro} - {unit.cidade}/{unit.uf}</p>
        <p>CEP: {unit.cep}</p>
        {unit.telefone && <p>Tel: {unit.telefone}</p>}
      </address>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium no-underline"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Ver no mapa
      </a>
    </div>
  )
}


export default function Contato({ data }) {
  if (!data) return null

  const { telefone, email, enderecos, social } = data
  const contacts = telefone?.contatos ? Object.values(telefone.contatos) : []

  return (
    <section id="contato" className="py-(--spacing-section) px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <SectionHeading className="mb-12">
        {data.titulo || 'Contato'}
      </SectionHeading>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact info and form */}
        <div>
          {/* Phone/WhatsApp */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              {telefone?.subtitulo || 'Telefone/WhatsApp'}
            </h3>
            <div className="space-y-3">
              {contacts.map((contact) => (
                <a
                  key={contact.numero}
                  href={`https://wa.me/55${contact.numero.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors no-underline"
                >
                  <span className="text-primary-600 text-xl" aria-hidden="true">📱</span>
                  <div>
                    <p className="font-medium text-neutral-800">{contact.nome}</p>
                    <p className="text-sm text-neutral-600">{contact.numero}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Email */}
          {email && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {email.subtitulo || 'E-mail'}
              </h3>
              <a
                href={`mailto:${email.endereco}`}
                className="text-primary-600 hover:text-primary-700 no-underline"
              >
                {email.endereco}
              </a>
            </div>
          )}

          {/* Social media */}
          {social && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                {social.subtitulo || 'Redes Sociais'}
              </h3>
              <div className="space-y-3">
                {social.fb?.url && (
                  <a
                    href={social.fb.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors no-underline"
                  >
                    <img src={`/${social.fb.img?.src}`} alt="Facebook" className="w-8 h-8" />
                    <span className="font-medium text-neutral-800">Facebook</span>
                  </a>
                )}
                {social.insta?.url && (
                  <a
                    href={social.insta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors no-underline"
                  >
                    <img src={`/${social.insta.img?.src}`} alt="Instagram" className="w-8 h-8" />
                    <span className="font-medium text-neutral-800">Instagram</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Units */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Nossas Unidades</h3>
          <div className="space-y-4">
            {enderecos?.map((unit, index) => (
              <UnitCard key={index} unit={unit} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
