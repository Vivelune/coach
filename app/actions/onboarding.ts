'use server'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/user'

const schema = z.object({
  heightCm: z.coerce.number().min(120).max(230),
  age: z.coerce.number().int().min(18).max(90),
  sex: z.enum(['male', 'female']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'high']),
  goal: z.enum(['cut', 'bulk', 'recomp']),
  targetRate: z.coerce.number().min(-1).max(0.5), // kg/week, negative = loss
})

export async function saveProfile(formData: FormData) {
  const user = await getOrCreateUser()
  const data = schema.parse(Object.fromEntries(formData))
  await prisma.user.update({ where: { id: user.id }, data })
  redirect('/dashboard')
}