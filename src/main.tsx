import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // <-- Questa riga è FONDAMENTALE per la grafica

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)