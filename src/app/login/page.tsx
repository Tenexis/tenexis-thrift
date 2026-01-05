'use client'

import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { loginWithGoogleAction } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      const result = await loginWithGoogleAction(credentialResponse.credential)
      
      if (result.success) {
        console.log("Login successful!")
        router.push('/dashboard') 
        router.refresh() 
      } else {
        console.error("Login failed", result.error)
      }
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4">
      {/* Shadcn Card Component */}
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription>
            Sign in to your Tenexis account to continue
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid gap-4 pt-4 pb-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* The Google Button */}
            <div className="w-full flex justify-center">
              <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={() => console.log('Login Failed')}
                  theme="outline" 
                  size="large"
                  width="300" // Forces the button to be wider
                  text="signin_with"
                  shape="rectangular"
                  useOneTap
                />
              </GoogleOAuthProvider>
            </div>
            
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <a href="/terms" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}