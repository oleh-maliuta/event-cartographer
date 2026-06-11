import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './providers/ThemeProvider.jsx'
import { TimeZoneProvider } from './providers/TimeZoneProvider.jsx'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './main.css'
import './i18next.js'
import 'leaflet/dist/leaflet.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Suspense fallback="loading...">
            <ThemeProvider>
                <TimeZoneProvider>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </TimeZoneProvider>
            </ThemeProvider>
        </Suspense>
    </StrictMode>,
)
