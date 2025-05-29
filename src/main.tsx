import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom' // Ensure HashRouter is imported
import { AuthProvider } from './hooks/useAuth'
import { Toaster } from '@/components/ui/toaster'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <AuthProvider>
      <Toaster />
      <App />
    </AuthProvider>
  </HashRouter>
);