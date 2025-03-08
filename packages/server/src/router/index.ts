import { router } from 'trpc'
import { todoRouter } from 'router/todoRouter'
import { authRouter } from 'router/auth.router'

export const appRouter = router({
  auth: authRouter,
  todo: todoRouter
})

export type AppRouter = typeof appRouter
