'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import { ComponentProps, ReactNode } from 'react'

type ButtonComponentProps = ComponentProps<typeof Button>

interface LoginLinkProps extends Omit<ButtonComponentProps, 'asChild'> {
    children?: ReactNode
    showIcon?: boolean
}

/**
 * A login button that automatically captures the current URL
 * and redirects back after successful login
 */
export function LoginLink({ children, showIcon = true, ...props }: LoginLinkProps) {
    const pathname = usePathname()
    const loginUrl = `/login?returnTo=${encodeURIComponent(pathname)}`

    return (
        <Button asChild {...props}>
            <Link href={loginUrl}>
                {showIcon && <Lock className="w-4 h-4 mr-2" />}
                {children || 'Sign in'}
            </Link>
        </Button>
    )
}

/**
 * Simple link version (not a button) for use in text
 */
export function LoginTextLink({ children, className }: { children?: ReactNode; className?: string }) {
    const pathname = usePathname()
    const loginUrl = `/login?returnTo=${encodeURIComponent(pathname)}`

    return (
        <Link href={loginUrl} className={className}>
            {children || 'Sign in'}
        </Link>
    )
}
