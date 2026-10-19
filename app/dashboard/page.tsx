import { redirect } from 'next/navigation'
import { getOrCreateUser } from '@/lib/user'
import { logWeight } from '@/app/actions/weight'

export default async function Dashboard() {
  const user = await getOrCreateUser()
  if (user.heightCm == null) redirect('/onboarding')

  return (
    <main className="mx-auto w-full max-w-md space-y-6 p-4">
      <h1 className="text-2xl font-bold">Today</h1>
      <form action={logWeight} className="flex gap-2">
        <input name="kg" type="number" step="0.1" inputMode="decimal"
          placeholder="Weight (kg)" required className="flex-1 rounded-md border px-3 py-2" />
        <button className="rounded-md bg-black px-4 py-2 text-white dark:bg-white dark:text-black">Log</button>
      </form>
    </main>
  )
}