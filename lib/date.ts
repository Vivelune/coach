import { cookies } from 'next/headers'

export async function getToday(): Promise<Date> {
  const raw = (await cookies()).get('tz')?.value ?? 'UTC'
  const tz = decodeURIComponent(raw)
  let ymd: string
  try {
    ymd = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date()) // YYYY-MM-DD
  } catch {
    ymd = new Date().toISOString().slice(0, 10)
  }
  return new Date(`${ymd}T00:00:00.000Z`)
}