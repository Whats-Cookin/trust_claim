import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import { CeramicWrapper } from './composedb/ceramic_context'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <CeramicWrapper>
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  </CeramicWrapper>
)
