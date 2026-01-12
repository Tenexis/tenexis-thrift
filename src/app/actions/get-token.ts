'use server'
import { cookies } from 'next/headers'

export async function getAuthToken() {
    const cookieStore = await cookies();
    return cookieStore.get("session_token")?.value;
}