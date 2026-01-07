'use server'

import { cookies } from 'next/headers'

// --- Types ---
interface BackendAuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  name: string;
  email: string;
  picture?: string;
  image?: string; 
}

// --- 1. Login Action ---
export async function loginWithGoogleAction(credential: string) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const backendResponse = await fetch(`${backendUrl}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    })

    if (!backendResponse.ok) {
      return { success: false, error: 'Backend login failed' }
    }

    const data = (await backendResponse.json()) as BackendAuthResponse
    const token = data.access_token

    // Environment checks
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieDomain = isProduction ? '.tenexis.in' : undefined;

    const cookieStore = await cookies()
    
    // Set cookie
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: isProduction,
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

// --- 2. Logout Action ---
export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('session_token')
}

// --- 3. Get Session (Fetch User Profile) ---
export async function getSession(): Promise<UserProfile | null> {
  console.log("GETSESSION");
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return null;

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log("GETSESSION TRY");
    const res = await fetch(`${backendUrl}/api/users/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store", 
    });
    console.log("GETSESSION RES");
    console.log(res.ok);
    if (!res.ok) return null;
    
    console.log("GETSESSION USER");
    const user = await res.json();
    console.log("GETSESSION USER");
    console.log(user);
    return user as UserProfile;

  } catch (error) {
    return null;
  }
}