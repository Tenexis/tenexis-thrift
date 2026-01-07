// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose' // Lightweight JWT lib safe for Edge

const SECRET_KEY = new TextEncoder().encode(process.env.SECRET_KEY || "super-secret-key")

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verify JWT locally (Edge Safe) - No DB calls
    await jwtVerify(token, SECRET_KEY)
    return NextResponse.next()
  } catch (err) {
    // Token invalid or expired
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/profile/:path*'],
}