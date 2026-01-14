'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Revalidate all product listings
 * Call this after adding, editing, or deleting a product
 */
export async function revalidateProducts() {
    revalidateTag('products')
}

/**
 * Revalidate a specific product
 * Call this after editing a specific product
 */
export async function revalidateProduct(slug: string) {
    revalidateTag(`product-${slug}`)
}

/**
 * Revalidate user data after profile updates
 * Call this after updating user profile or onboarding
 */
export async function revalidateUser() {
    revalidateTag('user')
    revalidatePath('/', 'layout')
}
