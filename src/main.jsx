import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Formulaire, MultiEtapes, Competences, Inscription } from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Formulaire />
    <MultiEtapes />
    <Competences />
    <Inscription />

  </StrictMode>,
)
