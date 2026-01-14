'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageData {
    id: number;
    url: string;
}

interface ProductImageGalleryProps {
    images: ImageData[];
    title: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function getImageUrl(url: string): string {
    // If URL is already absolute, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    // Prefix relative URLs with API base URL
    return `${API_URL}${url}`;
}

export function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    // Fallback for no images
    const displayImages: ImageData[] = images.length > 0
        ? images
        : [{ id: 0, url: '/placeholder-product.png' }];

    const handlePrevious = () => {
        setActiveIndex(prev => (prev === 0 ? displayImages.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setActiveIndex(prev => (prev === displayImages.length - 1 ? 0 : prev + 1));
    };

    const currentImageUrl = getImageUrl(displayImages[activeIndex].url);

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted group">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={currentImageUrl}
                            alt={`${title} - Image ${activeIndex + 1}`}
                            fill
                            className={cn(
                                "object-cover transition-transform duration-500",
                                isZoomed && "scale-150 cursor-zoom-out"
                            )}
                            priority
                            onClick={() => setIsZoomed(!isZoomed)}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {displayImages.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevious}
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-zinc-900 shadow-lg"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-zinc-900 shadow-lg"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}

                {/* Zoom Hint */}
                <div className="absolute bottom-3 right-3 p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-4 h-4 text-muted-foreground" />
                </div>

                {/* Image Counter */}
                {displayImages.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-medium">
                        {activeIndex + 1} / {displayImages.length}
                    </div>
                )}
            </div>

            {/* Thumbnail Strip */}
            {displayImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {displayImages.map((image, index) => (
                        <button
                            key={image.id}
                            onClick={() => setActiveIndex(index)}
                            className={cn(
                                "relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all",
                                index === activeIndex
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-transparent opacity-60 hover:opacity-100"
                            )}
                        >
                            <Image
                                src={getImageUrl(image.url)}
                                alt={`${title} thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

