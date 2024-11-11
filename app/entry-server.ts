/// <reference types="vinxi/types/server" />

import { getRouterManifest } from '@tanstack/start/router-manifest'
import { createStartHandler, defaultStreamHandler } from '@tanstack/start/server'

import { parseEnv } from '@/lib/env'
import { createRouter } from '@/lib/router'

parseEnv()

export default createStartHandler({ createRouter, getRouterManifest })(defaultStreamHandler)
