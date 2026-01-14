import Link from 'next/link';
import Image from 'next/image';
import { getProducts, getCategories } from './actions/products';
import { getUser } from '@/lib/get-user';
import { Button } from '@/components/ui/button';
import { 
    Plus, 
    Search, 
    Sparkles, 
    Users, 
    ArrowRight, 
    Zap, 
    ShieldCheck, 
    GraduationCap 
} from 'lucide-react';
import { HomeClient } from '@/components/home-client';

export default async function Home() {
    // Parallel data fetching
    const [products, categories, user] = await Promise.all([
        getProducts(),
        getCategories(),
        getUser(),
    ]);

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
            
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-border/40">
                {/* Abstract Background Gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
                
                <div className="container relative mx-auto px-4 py-16 md:py-24 lg:py-32">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        
                        {/* Hero Text Content */}
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium border border-primary/10 shadow-xs">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Campus Marketplace</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-foreground">
                                Buy, Sell & Discover <br className="hidden lg:block" />
                                <span className="text-primary mt-2 inline-block">On Campus</span>
                            </h1>

                            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                                The trusted peer-to-peer marketplace. Find textbooks, electronics, and hostel essentials from verified students at your college.
                            </p>

                            {/* Search Bar */}
                            <div className="w-full max-w-lg relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary opacity-30 blur-md transition duration-1000 group-hover:opacity-50" />
                                <div className="relative bg-background rounded-2xl shadow-sm">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search for books, electronics, notes..."
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-transparent border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-4 pt-2">
                                <Button asChild size="lg" className="rounded-full px-8 h-12 text-base font-medium shadow-md hover:shadow-lg transition-shadow">
                                    <Link href="/add-product">
                                        <Plus className="w-5 h-5 mr-2" />
                                        Sell Item
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-12 text-base font-medium bg-background/50 hover:bg-muted/50">
                                    <Link href="#products">
                                        Browse Items
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Hero Image / Graphic with Loading State */}
                        <div className="relative hidden lg:block h-[500px] w-full">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-[2rem] transform rotate-3 scale-95 opacity-50 blur-xl" />
                            <div className="relative h-full w-full rounded-[2rem] overflow-hidden border border-border/50 shadow-2xl bg-muted/20">
                                {/* Note: Using a placeholder image service here. 
                                   Replace 'src' with your actual hero asset.
                                   'priority' ensures LCP optimization.
                                   'blurDataURL' adds the loading effect.
                                */}
                                <Image
                                    src="/hero-image.png"
                                    alt="Students studying and trading"
                                    fill
                                    className="object-cover"
                                    priority
                                    placeholder="blur"
                                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAaCAYAAADWm14/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAETUlEQVR4nO1WXUybVRjuhdk1CTe7Qa+53pZFQ2N2I5E5o0xRZmW1pusga+UvtRYKrmu3lfGzKkwNEXAF1nV0dUhnBCkEARMMc5aWTmjp7BqrpLQUsGBb+5j3jK/pCGIRM298kpOec/p95zzned73PR8Pe8Dc3BzC4fBelgDvn7wUCATQ398PvV6PwcFBLC4uoqSkBNnZ2cjJyWHPJJFMe4P6yd0TSCQSrBFisRjW19dZv6OjAyaTCRaLBWtra+DxeI80jgT3/L+igNvtZpITvF4vRkZG2C+BlEgnkJWVhY31Dfh8Pvh/9uP+T/cR+DWwewI+nw9TU1MpFQh0YlKAfjmp16O/Q1QjROX7FQh4f8E7dVIclh5A7ZAc0j4xJDdFEDe/hdXl1cwJJBIJSCQSiEQiyGQyBIPB1Hx7ezuGh4fZnMPhwJ3v7uCIjA/+2WdQpanC8NAwJJ+IoHPX47JHi2aPGqrP5QgvLWdGILF54qKiIqhUKhQXF6figGC32xmpowXHkJeXB2mFFE8XHMYx4VGIzpyEZ34BP87O471r1bjgrkOjRw2FpRLhpXDmCsQ2N+P8zc3NZePXyl/F6NQo+sx90DSdY0oQSUrHL24NoNfQm1pj1jmL6j4pLrnrIe8rz5xAMBhk/lMUc4G174l9mPh2AvsP7oe64SzE8rfx1LNP4rrpOpRKJTQaDXp6elhskILxRJytZbUN4N1xKVRfyhFaCv09gUgkwhYiAkKhkG1uMBjYiclv+90ZNqY6QF5Hf4syq/h8fko1gtlsxvFXjrN+48BFnDYKM1MgGAyyFCP4/X4IBCfgnHWi4VIDG1PrNnSzlJxxzECtVrMUJdJkB52eChWnHG3a0taMsoZTqczJmADBZDSxoLJYbqH3Ri824htobWuF0WhES0sLCgsLMT09zQKTbBgfH4fL5UoRIDJkJaXqduDtRCAcDKO2W4GKzjIozJV4UV8AUacAL51/Aco6BduUbCotLWUpS0pwICWoRKfbkhGBSCQCm83G+m3mVtT/UAWNswanBoQQXXsDr7e/DIGpCF3WTkQjUUhlUlaWrVbrI3WC0jQ/P5/Zws1nRIBAMt5z3UONtRofLGjR5DnHmtapwuWF82zuzFUxDJ8ZmMRUDZN/JFMHIDXIDkrPrq4u7ARe+oBjOTkxiSuftuH07ZMQ3RDgircRHy5cYPmsna9Bha0MTUYdVldWsRJdYTJTUHLvU5bQ7UgFTC6Xbxt8OxKw22fQebUDX31/G4eOHGTBdEh8ABeHNGi26GCbfCjrzUEzhOVv4uuxITzwPUjdfmNjY9DpdEx+7sLKiMB2ZFxOF2oVKjjuOhDfiLOW2CwyH3d/hOdPPAetXs3GXPEhRf7K810RiCfiWz4sHt5+5Dv7PxbH6DcjUDUqEQqFdvye2DUBDrTA1hNRoKWPlyPLqdM/lk+ydBCRrSo9VgJ7BW/PK/xPYI/4zwn8CUIaqJJ5XxRkAAAAAElFTkSuQmCC"
                                />
                                
                                {/* Floating Cards Overlay */}
                                <div className="absolute bottom-6 left-6 right-6 bg-background/90 backdrop-blur-md p-4 rounded-xl border border-border/50 shadow-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">Verified Students Only</p>
                                            <p className="text-xs text-muted-foreground">Safe transactions within your campus</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 border-b border-border/40 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/0 md:divide-border/40">
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="p-2 bg-primary/10 rounded-full text-primary mb-2">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div className="text-3xl font-bold tracking-tight text-foreground">500+</div>
                            <div className="text-sm font-medium text-muted-foreground">Active Listings</div>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="p-2 bg-primary/10 rounded-full text-primary mb-2">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div className="text-3xl font-bold tracking-tight text-foreground">50+</div>
                            <div className="text-sm font-medium text-muted-foreground">Partner Colleges</div>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="p-2 bg-primary/10 rounded-full text-primary mb-2">
                                <Users className="w-5 h-5" />
                            </div>
                            <div className="text-3xl font-bold tracking-tight text-foreground">1k+</div>
                            <div className="text-sm font-medium text-muted-foreground">Verified Students</div>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="p-2 bg-primary/10 rounded-full text-primary mb-2">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div className="text-3xl font-bold tracking-tight text-foreground">₹5L+</div>
                            <div className="text-sm font-medium text-muted-foreground">Student Savings</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section id="products" className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div className="space-y-2">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                                {user ? 'Products Near You' : 'Fresh Arrivals'}
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl">
                                {user
                                    ? `Showing verified listings from ${user.college?.name || 'your campus'}`
                                    : 'Discover textbooks, gadgets, and gear listed by students today.'}
                            </p>
                        </div>

                        {user && (
                            <Button asChild className="rounded-full shadow-sm hover:shadow-md transition-all">
                                <Link href="/add-product">
                                    <Plus className="w-4 h-4 mr-2" />
                                    List an Item
                                </Link>
                            </Button>
                        )}
                    </div>

                    {/* Client-side Filter & Grid */}
                    <HomeClient
                        initialProducts={products}
                        categories={categories}
                        isLoggedIn={!!user}
                    />
                </div>
            </section>

            {/* CTA Section for Non-logged in users */}
            {!user && (
                <section className="py-24 bg-muted/30 border-t border-border/40">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center space-y-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-background border border-border shadow-sm mb-4">
                                <Users className="w-10 h-10 text-primary" />
                            </div>
                            
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                                Join Your Campus Community
                            </h2>
                            
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                Sign up with your college email to access exclusive deals,
                                connect with verified students, and start selling today.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                <Button asChild size="lg" className="rounded-full px-10 h-14 text-lg font-medium shadow-lg hover:shadow-xl transition-all">
                                    <Link href="/login">
                                        Get Started
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}