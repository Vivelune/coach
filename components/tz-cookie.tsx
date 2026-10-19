'use client'
import { useEffect } from 'react'

export default function TzCookie() {
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const current = document.cookie.split('; ').find((c) => c.startsWith('tz='))?.split('=')[1]
    if (current !== encodeURIComponent(tz)) {
      document.cookie = `tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`
    }
  }, [])
  return null
}