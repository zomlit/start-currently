/// <reference types="vinxi/types/client" />

import { StartClient } from '@tanstack/start'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'

import { createRouter } from '@/lib/router'

const router = createRouter()

hydrateRoot(window.root, (
  <StrictMode>
    <StartClient router={router} />
  </StrictMode>
))
