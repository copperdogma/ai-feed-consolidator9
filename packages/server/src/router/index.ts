import { router } from 'trpc'
import { todoRouter } from 'router/todoRouter'
import { authRouter } from 'router/auth.router'
import { userRouter } from 'router/user.router'

export const appRouter = router({
  auth: authRouter,
  todo: todoRouter,
  user: userRouter
})

export type AppRouter = typeof appRouter
