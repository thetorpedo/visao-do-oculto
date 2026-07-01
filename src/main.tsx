import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'
import App from './App.tsx'
import { DataProvider } from './context/DataContext.tsx'
import { FavoritosProvider } from './context/FavoritosContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DataProvider>
      <FavoritosProvider>
        <App />
      </FavoritosProvider>
    </DataProvider>
  </StrictMode>,
)