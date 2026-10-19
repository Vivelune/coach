import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function getOrCreateUser() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')
  return prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: { clerkId: userId },
  })
}