import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import { useSupabaseStore } from './stores/supabaseStore'
import AppRoutes from './routes'
import PWAInstallPrompt from './components/pwa/PWAInstallPrompt'
import PWAUpdatePrompt from './components/pwa/PWAUpdatePrompt'
import OfflineIndicator from './components/pwa/OfflineIndicator'

function App() {
  const initialize = useSupabaseStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <AppRoutes />
      <PWAInstallPrompt />
      <PWAUpdatePrompt />
      <OfflineIndicator />
    </BrowserRouter>
  )
}

export default App