'use client'

import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { loginWithGoogleAction } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'
import { jwtDecode } from "jwt-decode"; // You might need to install this: npm install jwt-decode
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface TokenPayload {
  sub: string;
  user_id: number;
  username: string;
  college_slug: string | null;
  is_verified: boolean;
  is_onboarded: boolean; // This is the key field we need
  exp: number;
}

export default function LoginPage() {
  const router = useRouter()

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      const result = await loginWithGoogleAction(credentialResponse.credential)

      if (result.success && result.token) { // Ensure your action returns the token string too
        // Decode to check onboarding status
        const decoded = jwtDecode<TokenPayload>(result.token);
        console.log("Login successful!", decoded);

        router.refresh()

        if (decoded.is_onboarded) {
          router.push('/')
        } else {
          router.push('/onboarding') // Redirects to the form you made earlier
        }
      } else {
        console.error("Login failed", result.error)
      }
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
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
    </div>
  )
}