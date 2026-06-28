import { useState } from 'react'
import logo from '../assets/logo.png'

const navLinks = [
  { label: 'Início', href: '#inicio' },
  { label: 'História', href: '#historia' },
  { label: 'Missão', href: '#missao' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Hippussuit', href: '#hippussuit' },
  { label: 'Mídia', href: '#midia' },
  { label: 'Contato', href: '#contato' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-neutral-200 shadow-sm">
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16"
        aria-label="Navegação principal"
      >
        <a href="#inicio" className="flex items-center gap-2">
          <img src={logo} alt="Projeto Liberdade" className="h-10 w-auto" />
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-6 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-neutral-700 hover:text-secondary-700 transition-colors no-underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md text-neutral-700 hover:bg-neutral-100"
          aria-expanded={menuOpen}
          aria-haspopup="true"
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-neutral-200 bg-white/95 backdrop-blur-md"
          role="menu"
        >
          <ul className="px-4 py-3 space-y-2 list-none m-0 p-0">
            {navLinks.map((link) => (
              <li key={link.href} role="none">
                <a
                  href={link.href}
                  role="menuitem"
                  className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-secondary-50 hover:text-secondary-700 no-underline"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
