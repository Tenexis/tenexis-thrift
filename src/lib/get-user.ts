import { cache } from 'react'
import { cookies } from 'next/headers'
import { UserProfile } from "@/app/actions/auth";

async function fetchUser(): Promise<UserProfile | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value

  if (!token) return null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0, tags: ['user'] }
    })
    if (res.ok) {
      const user = (await res.json()) as UserProfile
      return user
    }
  } catch (e) {
    console.error("Failed to fetch user", e)
  }

  return null
}

// Memoize within a single request to avoid duplicate fetches in the same render
export const getUser = cache(fetchUser)