import prisma from 'sdks/prisma'
import { protectedProcedure, router } from 'trpc'
import * as z from 'zod'

export const todoRouter = router({
  list: protectedProcedure.query(async () => {
    return await prisma.todo.findMany({
      orderBy: { updatedAt: 'desc' }
    })
  }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1)
      })
    )
    .mutation(async ({ input }) => {
      // Create a new todo
      return await prisma.todo.create({
        data: {
          title: input.title
        }
      })
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      return prisma.todo.delete({
        where: {
          id: input.id
        }
      })
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          title: z.string().min(1).optional(),
          isCompleted: z.boolean().optional()
        })
      })
    )
    .mutation(async ({ input }) => {
      // Update a todo
      return await prisma.todo.update({
        where: { id: input.id },
        data: input.data
      })
    })
})
