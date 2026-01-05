'use server'

import { cookies } from 'next/headers'

interface BackendAuthResponse {
  access_token: string;
  token_type: string;
}

export async function loginWithGoogleAction(credential: string) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const backendResponse = await fetch(`${backendUrl}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    })

    if (!backendResponse.ok) {
      console.error('Backend rejected token:', backendResponse.status)
      return { success: false, error: 'Backend login failed' }
    }

    const data = (await backendResponse.json()) as BackendAuthResponse
    const token = data.access_token

    const isDev = process.env.NEXTJS_ENV === 'development'
    const cookieDomain = isDev ? undefined : '.tenexis.in'

    const cookieStore = await cookies()
    
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      domain: cookieDomain,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true }
    
  } catch (error) {
    console.error('Auth Action Error:', error)
    return { success: false, error: 'Internal Server Error' }
  }
}