import { publicProcedure, router } from 'trpc'
import { z } from 'zod'

export const authRouter = router({
  getUser: publicProcedure.query(({ ctx }) => {
    return ctx.user
  }),
  logout: publicProcedure.mutation(({ ctx }) => {
    // Firebase handles logout on the client side
    // This endpoint just clears any server-side state if needed
    ctx.user = null
  }),
})
