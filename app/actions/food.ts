'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/user'
import { getToday } from '@/lib/date'

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  meal: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  kcal: z.coerce.number().min(0).max(5000).default(0),
  protein: z.coerce.number().min(0).max(500).default(0),
  carbs: z.coerce.number().min(0).max(1000).default(0),
  fat: z.coerce.number().min(0).max(500).default(0),
})

export async function addFood(formData: FormData) {
  const user = await getOrCreateUser()
  const d = schema.parse(Object.fromEntries(formData))
  // If kcal is left blank, derive it from macros (4/4/9)
  const kcal = d.kcal || Math.round(d.protein * 4 + d.carbs * 4 + d.fat * 9)
  await prisma.foodLog.create({
    data: { ...d, kcal, userId: user.id, date: await getToday() },
  })
  revalidatePath('/dashboard')
}

export async function repeatFood(formData: FormData) {
  const user = await getOrCreateUser()
  const id = z.string().parse(formData.get('id'))
  const src = await prisma.foodLog.findFirst({ where: { id, userId: user.id } })
  if (!src) return
  const { id: _id, ...rest } = src
  await prisma.foodLog.create({ data: { ...rest, date: await getToday() } })
  revalidatePath('/dashboard')
}

export async function deleteFood(formData: FormData) {
  const user = await getOrCreateUser()
  const id = z.string().parse(formData.get('id'))
  await prisma.foodLog.deleteMany({ where: { id, userId: user.id } }) // userId check = ownership
  revalidatePath('/dashboard')
}