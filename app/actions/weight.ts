'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/user'

export async function logWeight(formData: FormData) {
  const user = await getOrCreateUser()
  const kg = z.coerce.number().min(30).max(300).parse(formData.get('kg'))
  const date = new Date()
  date.setUTCHours(0, 0, 0, 0)

  await prisma.weightEntry.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: { kg },
    create: { userId: user.id, date, kg },
  })
  revalidatePath('/dashboard')
}