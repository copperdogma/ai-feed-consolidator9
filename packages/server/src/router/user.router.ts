import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { UserSchema } from '../generated/zod/modelSchema/UserSchema';

export const userRouter = router({
  /**
   * Get the current user's profile
   */
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      // ctx.user is already available from the context
      return ctx.user;
    }),
  
  /**
   * Update the current user's profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        avatar: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, user } = ctx;
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      // Update only the fields that were provided
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: input.name !== undefined ? input.name : undefined,
          avatar: input.avatar !== undefined ? input.avatar : undefined,
        },
      });
      
      return updatedUser;
    }),
}); 