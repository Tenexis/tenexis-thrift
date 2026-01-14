'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
    MapPin, 
    Clock, 
    Tag, 
    Heart, 
    DollarSign, 
    Hourglass, 
    HelpingHand, 
    AlertCircle, 
    Search 
} from 'lucide-react';
import { Product, ProductType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import process from 'process';

interface ProductCardProps {
    product: Product;
    index?: number;
}

const TYPE_CONFIG: Record<ProductType, { label: string; icon: React.ElementType; className: string }> = {
    [ProductType.sell]: {
        label: 'For Sale',
        icon: DollarSign,
        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    },
    [ProductType.rent]: {
        label: 'For Rent',
        icon: Hourglass,
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    },
    [ProductType.buy]: {
        label: 'Wanted',
        icon: HelpingHand,
        className: 'bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 border-violet-200 dark:border-violet-500/20',
    },
    [ProductType.lost]: {
        label: 'Lost',
        icon: AlertCircle,
        className: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    },
    [ProductType.found]: {
        label: 'Found',
        icon: Search,
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    },
};

function formatPrice(price?: number): string {
    if (price === undefined || price === null) return 'Free';
    if (price === 0) return 'Free';
    return `₹${price.toLocaleString('en-IN')}`;
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
    const typeConfig = TYPE_CONFIG[product.product_type];
    const Icon = typeConfig.icon;
    const imageUrl = product.images?.[0]?.url || '/placeholder-product.png';
    const isLostOrFound = product.product_type === ProductType.lost || product.product_type === ProductType.found;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="h-full"
        >
            <Link href={`/product/${product.slug}`} className="block h-full">
                <article className="group relative h-full flex flex-col bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50 hover:-translate-y-1">
                    
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`}
                            alt={product.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />

                        {/* Type Badge */}
                        <div className="absolute top-3 left-3 z-10">
                            <Badge variant="outline" className={cn('gap-1.5 px-2.5 py-1 font-medium backdrop-blur-md shadow-sm border', typeConfig.className)}>
                                <Icon className="w-3.5 h-3.5" />
                                {typeConfig.label}
                            </Badge>
                        </div>

                        {/* Wishlist Button */}
                        <button
                            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur-md text-muted-foreground opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-background hover:text-red-500 hover:shadow-md"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // TODO: Add to wishlist logic
                            }}
                        >
                            <Heart className="w-4 h-4" />
                        </button>

                        {/* Dark Gradient Overlay for text readability if needed later */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-4 space-y-3">
                        {/* Category & Date Row */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            {product.category && (
                                <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                                    <Tag className="w-3 h-3" />
                                    <span className="font-medium">{product.category.name}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatTimeAgo(product.created_at)}</span>
                            </div>
                        </div>

                        {/* Title & Price */}
                        <div className="space-y-1">
                            <h3 className="font-semibold text-foreground text-base line-clamp-1 group-hover:text-primary transition-colors">
                                {product.title}
                            </h3>

                            {!isLostOrFound && (
                                <div className="flex items-baseline gap-1">
                                    <p className="text-lg font-bold text-primary">
                                        {formatPrice(product.price)}
                                    </p>
                                    {product.product_type === ProductType.rent && (
                                        <span className="text-xs text-muted-foreground font-medium">/day</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-border/50 w-full mt-auto" />

                        {/* Footer: Location & User */}
                        <div className="flex items-center justify-between pt-1 gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="relative w-6 h-6 rounded-full overflow-hidden bg-muted shrink-0 border border-border">
                                    {product.user?.picture ? (
                                        <Image
                                            src={product.user.picture}
                                            alt={product.user.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-[10px] font-bold">
                                            {product.user?.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                                    {product.user?.name || 'Student'}
                                </span>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate max-w-[80px]">
                                    {product.city || product.user?.college?.city || 'Campus'}
                                </span>
                            </div>
                        </div>
                    </div>
                </article>
            </Link>
        </motion.div>
    );
}

// Skeleton loader for product cards
export function ProductCardSkeleton() {
    return (
        <div className="h-full bg-card rounded-2xl border border-border overflow-hidden">
            <div className="aspect-[4/3] bg-muted animate-pulse" />
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                    <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
                </div>
                <div className="pt-2 border-t border-border/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />
                        <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
}