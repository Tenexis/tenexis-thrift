// Product Types matching backend models

export enum ProductType {
    buy = "buy",
    rent = "rent",
    sell = "sell",
    lost = "lost",
    found = "found",
}

export enum ProductStatus {
    pending = "pending",
    active = "active",
    sold = "sold",
    found = "found",
    rejected = "rejected",
}

export enum ProductVisibility {
    public = "public",
    college = "college",
    city = "city",
    gender = "gender",
}

export interface College {
    id: number;
    name: string;
    slug: string;
    domain?: string;
    logo_url?: string;
    address?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    is_verified: boolean;
}

export interface ProductImage {
    id: number;
    url: string;
    product_id: number;
}

export interface ProductUser {
    id: number;
    username: string;
    name: string;
    picture?: string;
    college_id?: number;
    college?: College;
    gender?: string;
}

export interface Product {
    id: number;
    title: string;
    slug: string;
    description: string;
    price?: number;
    product_type: ProductType;
    status: ProductStatus;
    visibility: ProductVisibility;
    created_at: string;
    is_digital: boolean;
    pickup_address?: string;
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
    category_id?: number;
    category?: Category;
    user_id: number;
    user: ProductUser;
    images: ProductImage[];
}

// API Response types
export interface APIError {
    detail: string | { msg: string }[];
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
    pages: number;
}
