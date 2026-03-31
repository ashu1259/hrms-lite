import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e2334',
            color: '#e8ecf4',
            border: '1px solid #2a2f42',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#1e2334' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#1e2334' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
