import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './main.css'
import './i18next.js'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Suspense fallback="loading...">
            <App />
        </Suspense>
    </StrictMode>,
)
