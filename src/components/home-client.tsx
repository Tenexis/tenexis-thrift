'use client';

import { useState, useMemo } from 'react';
import { Product, Category, ProductType } from '@/lib/types';
import { ProductsGrid, ProductFilter } from './products-grid';

interface HomeClientProps {
    initialProducts: Product[];
    categories: Category[];
    isLoggedIn: boolean;
}

export function HomeClient({ initialProducts, categories, isLoggedIn }: HomeClientProps) {
    const [activeFilter, setActiveFilter] = useState<ProductType | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = useMemo(() => {
        let result = initialProducts;

        // Filter by type
        if (activeFilter !== 'all') {
            result = result.filter(p => p.product_type === activeFilter);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.category?.name.toLowerCase().includes(query)
            );
        }

        return result;
    }, [initialProducts, activeFilter, searchQuery]);

    return (
        <div className="space-y-6">
            {/* Filter Tabs */}
            <ProductFilter
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />

            {/* Products Grid */}
            <ProductsGrid
                products={filteredProducts}
                emptyMessage={
                    activeFilter === 'all'
                        ? "No products available yet"
                        : `No ${activeFilter} items found`
                }
            />
        </div>
    );
}
