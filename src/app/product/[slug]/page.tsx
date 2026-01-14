import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, getProducts } from '@/app/actions/products';
import { getUser } from '@/lib/get-user';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    ArrowLeft,
    MapPin,
    Clock,
    Tag,
    Heart,
    Share2,
    MessageCircle,
    ShieldCheck,
    ExternalLink,
    Lock,
    User as UserIcon,
    DollarSign,
    Hourglass,
    HelpingHand,
    AlertCircle,
    Search,
    Smartphone,
    Calendar,
    Eye
} from 'lucide-react';
import { ProductType, ProductVisibility } from '@/lib/types';
import { ProductImageGallery } from '@/components/product-image-gallery';
import { ProductsGrid } from '@/components/products-grid';
import { cn } from '@/lib/utils';

interface ProductPageProps {
    params: Promise<{ slug: string }>;
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

const VISIBILITY_LABELS: Record<ProductVisibility, string> = {
    [ProductVisibility.public]: 'Visible to everyone',
    [ProductVisibility.college]: 'Exclusive to your college',
    [ProductVisibility.city]: 'Exclusive to your city',
    [ProductVisibility.gender]: 'Restricted by gender',
};

function formatPrice(price?: number): string {
    if (price === undefined || price === null) return 'Free';
    if (price === 0) return 'Free';
    return `₹${price.toLocaleString('en-IN')}`;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const [product, currentUser, allProducts] = await Promise.all([
        getProductBySlug(slug),
        getUser(),
        getProducts(),
    ]);

    if (!product) {
        notFound();
    }

    const typeConfig = TYPE_CONFIG[product.product_type];
    const TypeIcon = typeConfig.icon;
    const isLostOrFound = product.product_type === ProductType.lost || product.product_type === ProductType.found;

    // Check ownership
    const isOwner = currentUser?.id === product.user_id;

    // Check if seller details are hidden (Backend sends user: null for guests)
    const isSellerHidden = !product.user;

    // Get related products (same category, excluding current)
    const relatedProducts = allProducts
        .filter(p => p.id !== product.id && p.category_id === product.category_id)
        .slice(0, 4);

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Back Navigation */}
            <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-md border-b border-border/40 supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-3">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to listings
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    
                    {/* Left: Image Gallery */}
                    <div className="w-full">
                        <ProductImageGallery images={product.images} title={product.title} />
                    </div>

                    {/* Right: Product Details */}
                    <div className="flex flex-col gap-6">
                        
                        {/* Header Section */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className={cn("px-3 py-1 text-sm font-medium border", typeConfig.className)}>
                                    <TypeIcon className="w-3.5 h-3.5 mr-1.5" />
                                    {typeConfig.label}
                                </Badge>

                                {product.category && (
                                    <Badge variant="secondary" className="px-3 py-1 text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                        <Tag className="w-3.5 h-3.5 mr-1.5" />
                                        {product.category.name}
                                    </Badge>
                                )}

                                {product.visibility !== ProductVisibility.public && (
                                    <Badge variant="outline" className="px-3 py-1 text-sm border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-900/20 dark:text-orange-400">
                                        <Lock className="w-3.5 h-3.5 mr-1.5" />
                                        Restricted
                                    </Badge>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight">
                                {product.title}
                            </h1>

                            {!isLostOrFound && (
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-bold text-primary">
                                        {formatPrice(product.price)}
                                    </span>
                                    {product.product_type === ProductType.rent && (
                                        <span className="text-lg font-medium text-muted-foreground mb-1">/ day</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-4 py-6 border-y border-border/50">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</p>
                                    <p className="font-medium text-foreground">
                                        {product.city || (product.user?.college?.city) || 'Hidden Location'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Posted On</p>
                                    <p className="font-medium text-foreground">{formatDate(product.created_at)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                                    <Eye className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Visibility</p>
                                    <p className="font-medium text-foreground">{VISIBILITY_LABELS[product.visibility]}</p>
                                </div>
                            </div>

                            {product.is_digital && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg">
                                        <Smartphone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Format</p>
                                        <p className="font-medium text-foreground">Digital Item</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold text-foreground">Description</h2>
                            <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-base">
                                {product.description}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            {!isOwner ? (
                                <>
                                    {currentUser ? (
                                        <Button size="lg" className="flex-1 rounded-full text-base font-semibold shadow-md hover:shadow-lg transition-all">
                                            <MessageCircle className="w-5 h-5 mr-2" />
                                            Contact Seller
                                        </Button>
                                    ) : (
                                        <Button size="lg" className="flex-1 rounded-full text-base font-semibold shadow-md" asChild>
                                            <Link href="/login">
                                                <Lock className="w-4 h-4 mr-2" />
                                                Sign in to Contact
                                            </Link>
                                        </Button>
                                    )}

                                    <Button size="lg" variant="outline" className="rounded-full px-6">
                                        <Heart className="w-5 h-5" />
                                        <span className="sr-only">Save to Wishlist</span>
                                    </Button>
                                    <Button size="lg" variant="outline" className="rounded-full px-6">
                                        <Share2 className="w-5 h-5" />
                                        <span className="sr-only">Share Product</span>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button size="lg" className="flex-1 rounded-full font-semibold" asChild>
                                        <Link href={`/edit-product/${product.slug}`}>
                                            Edit Listing
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="destructive" className="flex-1 rounded-full font-semibold">
                                        Mark as Sold
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Seller Card */}
                        <div className="mt-4">
                            {!isSellerHidden ? (
                                <div className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-sm transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-14 h-14 border-2 border-background ring-2 ring-border group-hover:ring-primary/20 transition-all">
                                            <AvatarImage src={product.user?.picture} alt={product.user?.name} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                                                {product.user?.name?.[0]?.toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-foreground text-lg truncate">
                                                    {product.user?.name}
                                                </p>
                                                <ShieldCheck className="w-4 h-4 text-primary" aria-label="Verified Student" />
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {product.user?.college?.name || 'Independent Seller'}
                                            </p>
                                        </div>

                                        <Button variant="ghost" size="sm" className="shrink-0 text-muted-foreground hover:text-foreground" asChild>
                                            <Link href={`/u/${product.user?.username}`}>
                                                Profile
                                                <ExternalLink className="w-4 h-4 ml-1.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                /* Hidden Seller State for Guests */
                                <div className="bg-muted/30 border border-dashed border-border rounded-2xl p-8 flex flex-col items-center text-center justify-center gap-4">
                                    <div className="p-3 bg-background rounded-full shadow-sm border border-border/50">
                                        <UserIcon className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-foreground">Seller details are hidden</h3>
                                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                            Sign in to view the seller&apos;s verified name, college, and contact info.
                                        </p>
                                    </div>
                                    <Button variant="secondary" className="px-6 rounded-full" asChild>
                                        <Link href="/login">
                                            Sign in to View
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-20 pt-10 border-t border-border/40">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">Similar Items</h2>
                                <p className="text-muted-foreground text-sm mt-1">
                                    More in {product.category?.name}
                                </p>
                            </div>
                            <Button variant="ghost" className="text-muted-foreground hover:text-primary" asChild>
                                <Link href={`/?category=${product.category?.slug}`}>
                                    View all
                                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                                </Link>
                            </Button>
                        </div>
                        <ProductsGrid products={relatedProducts} />
                    </section>
                )}
            </div>
        </div>
    );
}