import { cookies } from 'next/headers'
import { UserProfile } from "@/app/actions/auth";

export async function getUser(): Promise<UserProfile | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value

  if (!token) return null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store' 
    })
    // console.log(res);
    if (res.ok) {
      const user = (await res.json()) as UserProfile
      console.log(user);
      return user 
    }
  } catch (e) {
    console.error("Failed to fetch user", e)
  }

  return null
}