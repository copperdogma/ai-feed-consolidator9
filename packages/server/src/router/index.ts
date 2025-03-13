import { router } from '../trpc'
import { authRouter } from './auth.router'
import { userRouter } from './user.router'
import { feedRouter } from './feed.router'
import { adminRouter } from './admin.router'

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  feed: feedRouter,
  admin: adminRouter
})

export type AppRouter = typeof appRouter
