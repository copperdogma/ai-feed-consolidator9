import { TRPCError, initTRPC } from '@trpc/server'
import { Context } from 'lib/context'
import superjson from 'superjson'

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape }) => shape
})

export const router = t.router
export const middleware = t.middleware
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You need to be logged in to access this resource'
    })
  }
  return next({
    ctx: { user: ctx.user }
  })
})
