import 'module-alias/register'

import express from 'express'
import cors from 'cors'
import * as trpcExpress from '@trpc/server/adapters/express'
import { createContext } from 'lib/context'
import { appRouter } from 'router'
import cookieParser from 'cookie-parser'

const VITE_APP_URL = process.env.VITE_APP_URL
const PORT: number = Number(process.env.SERVER_PORT) || 3001

const app = express()
app.use(cors({ origin: `${VITE_APP_URL}`, credentials: true }))
app.use(cookieParser())

app.get('/healthcheck', (_req, res) => {
  res.send({ status: 'ok' })
})

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext
  })
)

app.listen(PORT, () => {
  console.log(`🚀 Server running on Port ${PORT}`)
})
