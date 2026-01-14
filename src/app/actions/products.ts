'use server'

import { cookies } from 'next/headers'
import { Product, Category } from '@/lib/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export async function getProducts(): Promise<Product[]> {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')?.value

    try {
        const headers: HeadersInit = {}
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        const res = await fetch(`${API_BASE_URL}/api/products/`, {
            headers,
            next: { revalidate: 60, tags: ['products'] }, // Revalidate every 60 seconds
        })

        if (!res.ok) {
            console.error('Failed to fetch products:', res.status)
            return []
        }

        const products = await res.json()
        return products as Product[]
    } catch (error) {
        console.error('Error fetching products:', error)
        return []
    }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')?.value

    try {
        const headers: HeadersInit = {}
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        const res = await fetch(`${API_BASE_URL}/api/products/${slug}`, {
            headers,
            next: { revalidate: 120, tags: ['products', `product-${slug}`] }, // Cache for 2 minutes
        })

        if (!res.ok) {
            return null
        }

        const product = await res.json()
        return product as Product
    } catch (error) {
        console.error('Error fetching product:', error)
        return null
    }
}

export async function getCategories(): Promise<Category[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/api/categories/`, {
            next: { revalidate: 300 }, // Cache for 5 minutes (categories rarely change)
        })

        if (!res.ok) {
            return []
        }

        const categories = await res.json()
        return categories as Category[]
    } catch (error) {
        console.error('Error fetching categories:', error)
        return []
    }
}
