import { Routes, Route } from 'react-router-dom'
import { LangProvider } from './context/LangContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ResultsPage from './pages/ResultsPage'
import RestaurantPage from './pages/RestaurantPage'
import AdminPage from './pages/AdminPage'
import TermsPage from './pages/legal/TermsPage'
import PrivacyPage from './pages/legal/PrivacyPage'
import LegalNoticePage from './pages/legal/LegalNoticePage'
import PartnerTermsPage from './pages/legal/PartnerTermsPage'
import PartnersPage from './pages/PartnersPage'

function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-4">🍽️</p>
        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <a href="/" className="text-brand-400 hover:underline text-sm">
          Back to home
        </a>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <LangProvider>
      <div className="min-h-dvh flex flex-col">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/restaurants/:id" element={<RestaurantPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/legal/terms" element={<TermsPage />} />
          <Route path="/legal/privacy" element={<PrivacyPage />} />
          <Route path="/legal/notice" element={<LegalNoticePage />} />
          <Route path="/legal/partner-terms" element={<PartnerTermsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </LangProvider>
  )
}
