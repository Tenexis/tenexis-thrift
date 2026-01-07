'use server'

import { TokenResponse } from '@react-oauth/google';
import { cookies } from 'next/headers'

export interface UserProfile {
  name: string;
  email: string;
  picture?: string;
  image?: string; 
}

export async function loginWithGoogleAction(credential: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    })

    if (!response.ok) return { success: false, error: 'Backend verification failed' }

    const data = (await response.json()) as TokenResponse

    const cookieStore = await cookies()
    
    cookieStore.set('session_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })

    return { success: true }
  } catch (error) {
    console.error("Auth Error:", error)
    return { success: false, error: 'Internal Server Error' }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('session_token')
  return { success: true }
}

export async function getSession(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return null;

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${backendUrl}/api/users/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store", 
    });
    if (!res.ok) return null;
    
    const user = await res.json();
    return user as UserProfile;

  } catch (error) {
    return null;
  }
}