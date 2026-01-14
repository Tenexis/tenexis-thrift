'use client';

import { Product, ProductType } from '@/lib/types';
import { ProductCard, ProductCardSkeleton } from './product-card';
import { motion } from 'framer-motion';
import { PackageOpen, Sparkles, DollarSign, Clock, Search, HelpingHand, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductsGridProps {
    products: Product[];
    loading?: boolean;
    emptyMessage?: string;
}

export function ProductsGrid({ products, loading = false, emptyMessage = "No products found" }: ProductsGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border/50 rounded-3xl bg-muted/10"
            >
                <div className="bg-muted p-4 rounded-full mb-4">
                    <PackageOpen className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{emptyMessage}</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                    Be the first to list something! Your campus community is waiting.
                </p>
            </motion.div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
            ))}
        </div>
    );
}

// Filter tabs for product types
interface ProductFilterProps {
    activeFilter: ProductType | 'all';
    onFilterChange: (filter: ProductType | 'all') => void;
}

const FILTER_OPTIONS = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: ProductType.sell, label: 'For Sale', icon: DollarSign },
    { id: ProductType.rent, label: 'For Rent', icon: Clock },
    { id: ProductType.buy, label: 'Wanted', icon: HelpingHand },
    { id: ProductType.lost, label: 'Lost', icon: AlertCircle },
    { id: ProductType.found, label: 'Found', icon: Search },
] as const;

export function ProductFilter({ activeFilter, onFilterChange }: ProductFilterProps) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mask-fade-sides">
            {FILTER_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = activeFilter === option.id;
                
                return (
                    <button
                        key={option.id}
                        onClick={() => onFilterChange(option.id)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 border",
                            isActive 
                                ? "bg-primary text-primary-foreground border-primary shadow-md transform scale-105" 
                                : "bg-background border-border text-muted-foreground hover:bg-muted hover:border-muted-foreground/20 hover:text-foreground"
                        )}
                    >
                        <Icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                        <span>{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
}