import {ReactDOM, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { CookiesProvider } from 'react-cookie';
import { AuthProvider } from './context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CookiesProvider>
    <BrowserRouter>
      <AuthProvider> 
        <App />
      </AuthProvider>
    </BrowserRouter>
    </CookiesProvider>
  </StrictMode>,
)
