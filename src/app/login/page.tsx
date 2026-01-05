'use client'

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { loginWithGoogleAction } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const handleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      // Call our Server Action
      const result = await loginWithGoogleAction(credentialResponse.credential)
      
      if (result.success) {
        console.log("Login successful!")
        router.push('/dashboard') // Redirect after login
        router.refresh() // Ensure middleware sees the new cookie
      } else {
        console.error("Login failed", result.error)
      }
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg text-center">
        <h2 className="text-2xl font-bold">Sign in to Tenexis</h2>
        
        <div className="flex justify-center">
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => console.log('Login Failed')}
              useOneTap
            />
          </GoogleOAuthProvider>
        </div>
      </div>
    </div>
  )
}