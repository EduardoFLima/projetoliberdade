import { useState, useEffect } from 'react'
import { fetchData } from './utils/fetchData'
import Header from './components/Header'
import Hero from './components/Hero'
import Historia from './components/Historia'
import MissaoVisaoValores from './components/MissaoVisaoValores'
import Servicos from './components/Servicos'
import Hippussuit from './components/Hippussuit'
import Midia from './components/Midia'
import Contato from './components/Contato'

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData().then((result) => {
      setData(result)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500 text-lg">Carregando...</p>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main>
        <Hero data={data?.home} />
        <Historia data={data?.historia} />
        <MissaoVisaoValores data={data?.missao} />
        <Servicos data={data?.servicos} />
        <Hippussuit data={data?.hippussuit} />
        <Midia fotos={data?.fotos} videos={data?.videos} />
        <Contato data={data?.contato} />
      </main>
      <footer className="bg-neutral-900 text-neutral-400 text-center py-8 px-4">
        <p className="text-sm">
          © {new Date().getFullYear()} Projeto Liberdade - Reabilitação e Equoterapia. Todos os direitos reservados.
        </p>
      </footer>
    </>
  )
}

export default App
