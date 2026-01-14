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
            cache: 'no-store',
        })

        if (!res.ok) {
            console.error('Failed to fetch products:', res.status)
            return []
        }

        const products = await res.json()
        console.log("Product Get: ", products);
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
            cache: 'no-store',
        })

        if (!res.ok) {
            return null
        }

        const product = await res.json()
        console.log("Product Slog: ", product);
        return product as Product
    } catch (error) {
        console.error('Error fetching product:', error)
        return null
    }
}

export async function getCategories(): Promise<Category[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/api/categories/`, {
            cache: 'no-store',
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
