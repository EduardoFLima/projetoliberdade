import { useState } from 'react'

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

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório'
    if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'E-mail inválido'
    if (!formData.message.trim()) newErrors.message = 'Mensagem é obrigatória'
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-primary-50 rounded-[var(--radius-card)] p-8 text-center" role="alert">
        <p className="text-primary-700 font-medium text-lg">Mensagem enviada com sucesso!</p>
        <p className="text-neutral-600 mt-2">Entraremos em contato em breve.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-neutral-700 mb-1">
          Nome
        </label>
        <input
          id="contact-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className="w-full px-4 py-2 border border-neutral-300 rounded-[var(--radius-button)] focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
        {errors.name && <p id="name-error" className="text-red-600 text-sm mt-1" role="alert">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-neutral-700 mb-1">
          E-mail
        </label>
        <input
          id="contact-email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className="w-full px-4 py-2 border border-neutral-300 rounded-[var(--radius-button)] focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
        {errors.email && <p id="email-error" className="text-red-600 text-sm mt-1" role="alert">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-neutral-700 mb-1">
          Mensagem
        </label>
        <textarea
          id="contact-message"
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
          className="w-full px-4 py-2 border border-neutral-300 rounded-[var(--radius-button)] focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-y"
        />
        {errors.message && <p id="message-error" className="text-red-600 text-sm mt-1" role="alert">{errors.message}</p>}
      </div>
      <button
        type="submit"
        className="w-full px-6 py-3 bg-primary-600 text-white rounded-[var(--radius-button)] font-medium hover:bg-primary-700 transition-colors"
      >
        Enviar Mensagem
      </button>
    </form>
  )
}

export default function Contato({ data }) {
  if (!data) return null

  const { telefone, email, enderecos } = data
  const contacts = telefone?.contatos ? Object.values(telefone.contatos) : []

  return (
    <section id="contato" className="py-(--spacing-section) px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 text-center mb-12 font-[var(--font-heading)]">
        {data.titulo || 'Contato'}
      </h2>

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
                  className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors no-underline"
                >
                  <span className="text-green-600 text-xl" aria-hidden="true">📱</span>
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

          {/* Contact form */}
          <div className="bg-neutral-50 rounded-[var(--radius-card)] p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Envie uma mensagem</h3>
            <ContactForm />
          </div>
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
