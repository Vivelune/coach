import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/user'
import { getToday } from '@/lib/date'
import { logWeight } from '@/app/actions/weight'
import { addFood, repeatFood, deleteFood } from '@/app/actions/food'
import TzCookie from '@/components/tz-cookie'

const input = 'w-full rounded-md border px-3 py-2'
const btn = 'rounded-md bg-black px-4 py-2 text-white dark:bg-white dark:text-black'

export default async function Dashboard() {
  const user = await getOrCreateUser()
  if (user.heightCm == null) redirect('/onboarding')

  const today = await getToday()
  const since = new Date(today)
  since.setUTCDate(since.getUTCDate() - 30)

  const [todayFoods, todayWeight, history] = await Promise.all([
    prisma.foodLog.findMany({ where: { userId: user.id, date: today }, orderBy: { id: 'asc' } }),
    prisma.weightEntry.findUnique({ where: { userId_date: { userId: user.id, date: today } } }),
    prisma.foodLog.findMany({
      where: { userId: user.id, date: { gte: since } },
      orderBy: { date: 'desc' },
      take: 300,
    }),
  ])

  // Recents: most-logged foods in the last 30 days, one entry per name
  const byName = new Map<string, { item: (typeof history)[number]; count: number }>()
  for (const f of history) {
    const key = f.name.toLowerCase()
    const hit = byName.get(key)
    if (hit) hit.count++
    else byName.set(key, { item: f, count: 1 })
  }
  const recents = [...byName.values()].sort((a, b) => b.count - a.count).slice(0, 8)

  const total = todayFoods.reduce(
    (t, f) => ({ kcal: t.kcal + f.kcal, p: t.p + f.protein, c: t.c + f.carbs, f: t.f + f.fat }),
    { kcal: 0, p: 0, c: 0, f: 0 },
  )

  return (
    <main className="mx-auto w-full max-w-md space-y-8 p-4">
      <TzCookie />
      <h1 className="text-2xl font-bold">Today</h1>

      <section className="space-y-2">
        <h2 className="font-semibold">Weight</h2>
        <form action={logWeight} className="flex gap-2">
          <input name="kg" type="number" step="0.1" inputMode="decimal" placeholder="kg"
            defaultValue={todayWeight?.kg} required className={input} />
          <button className={btn}>Log</button>
        </form>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Food</h2>
          <p className="text-sm text-zinc-500">
            {Math.round(total.kcal)} kcal · {Math.round(total.p)}P {Math.round(total.c)}C {Math.round(total.f)}F
          </p>
        </div>

        {recents.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recents.map(({ item }) => (
              <form key={item.id} action={repeatFood}>
                <input type="hidden" name="id" value={item.id} />
                <button className="rounded-full border px-3 py-1 text-sm">+ {item.name}</button>
              </form>
            ))}
          </div>
        )}

        <form action={addFood} className="grid grid-cols-4 gap-2">
          <input name="name" placeholder="Food" required className={`${input} col-span-3`} />
          <select name="meal" className={input} defaultValue="snack">
            <option value="breakfast">Brk</option>
            <option value="lunch">Lun</option>
            <option value="dinner">Din</option>
            <option value="snack">Snk</option>
          </select>
          <input name="kcal" type="number" inputMode="decimal" placeholder="kcal" className={input} />
          <input name="protein" type="number" inputMode="decimal" placeholder="P" className={input} />
          <input name="carbs" type="number" inputMode="decimal" placeholder="C" className={input} />
          <input name="fat" type="number" inputMode="decimal" placeholder="F" className={input} />
          <button className={`${btn} col-span-4`}>Add food</button>
        </form>

        <ul className="divide-y">
          {todayFoods.map((f) => (
            <li key={f.id} className="flex items-center justify-between py-2 text-sm">
              <span>
                {f.name} <span className="text-zinc-500">· {f.meal}</span>
              </span>
              <span className="flex items-center gap-3">
                {Math.round(f.kcal)} kcal
                <form action={deleteFood}>
                  <input type="hidden" name="id" value={f.id} />
                  <button className="text-zinc-400" aria-label="Delete">✕</button>
                </form>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}