'use client'

import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { loginWithGoogleAction } from '@/app/actions/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { jwtDecode } from "jwt-decode";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Suspense } from 'react'

interface TokenPayload {
  sub: string;
  user_id: number;
  username: string;
  college_slug: string | null;
  is_verified: boolean;
  is_onboarded: boolean;
  exp: number;
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get the return URL from query params, default to home
  const returnTo = searchParams.get('returnTo') || '/'

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      const result = await loginWithGoogleAction(credentialResponse.credential)

      if (result.success && result.token) {
        const decoded = jwtDecode<TokenPayload>(result.token);
        console.log("Login successful!", decoded);

        if (decoded.is_onboarded) {
          // Redirect back to the original page or home
          router.push(returnTo)
        } else {
          // New users go to onboarding, then will be redirected to home
          router.push('/onboarding')
        }
        router.refresh()
      } else {
        console.error("Login failed", result.error)
      }
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-zinc-200 dark:border-zinc-800">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-3xl font-bold tracking-tight">Tenexis</CardTitle>
        <CardDescription>Campus Marketplace & Lost/Found</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-8 pt-4">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.log('Login Failed')}
            theme="outline"
            size="large"
            shape="pill"
            width="300"
          />
        </GoogleOAuthProvider>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md shadow-xl border-zinc-200 dark:border-zinc-800">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight">Tenexis</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
        </Card>
      }>
        <LoginContent />
      </Suspense>
    </div>
  )
}
