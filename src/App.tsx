import { LanguageProvider } from './context/LanguageContext'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Experience } from './components/Experience'
import { Skills } from './components/Skills'
import { Projects } from './components/Projects'
import { HowIWork } from './components/HowIWork'
import { Notes } from './components/Notes'
import { Education } from './components/Education'
import { Footer } from './components/Footer'

function App() {
  return (
    <LanguageProvider>
      <Nav />
      <main>
        <Hero />
        <Projects />
        <HowIWork />
        <Notes />
        <Experience />
        <Skills />
        <Education />
      </main>
      <Footer />
    </LanguageProvider>
  )
}

export default App
