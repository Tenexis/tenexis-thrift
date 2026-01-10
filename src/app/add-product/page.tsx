'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, MapPin, DollarSign, CheckCircle2, Loader2, ArrowRight, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAuthToken } from '../actions/get-token';
import Image from 'next/image';

// --- Constants ---
const PRODUCT_TYPES = [
    { id: 'sell', label: 'Sell', emoji: '💰', color: 'bg-green-100 border-green-200 text-green-700' },
    { id: 'rent', label: 'Rent', emoji: '⏳', color: 'bg-blue-100 border-blue-200 text-blue-700' },
    { id: 'buy', label: 'Request to Buy', emoji: '🙋', color: 'bg-purple-100 border-purple-200 text-purple-700' },
    { id: 'lost', label: 'Lost Item', emoji: '🔍', color: 'bg-red-100 border-red-200 text-red-700' },
    { id: 'found', label: 'Found Item', emoji: '🙌', color: 'bg-yellow-100 border-yellow-200 text-yellow-700' },
];

const VISIBILITY_OPTIONS = [
    { id: 'public', label: 'Everyone', desc: 'Visible to the world' },
    { id: 'college', label: 'My College', desc: 'Only students from your college' },
    { id: 'city', label: 'My City', desc: 'People in your current city' },
    { id: 'gender', label: 'My Gender', desc: 'Hostel/Gender specific items' },
];

export default function AddProductPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // --- State ---
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');

    // Form Data
    const [formData, setFormData] = useState({
        product_type: '',
        title: '',
        description: '',
        price: '',
        is_digital: false,
        city: '',
        visibility: 'public',
        category_name: '', // Simple string for now
        images: [] as File[],
    });

    // --- 1. Init: Check URL for Type ---
    useEffect(() => {
        const typeParam = searchParams.get('type');
        if (typeParam && PRODUCT_TYPES.some(t => t.id === typeParam)) {
            setFormData(prev => ({ ...prev, product_type: typeParam }));
            setStep(2); // Skip to next step
        }
    }, [searchParams]);

    // --- Handlers ---
    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFormData(prev => ({ ...prev, images: [...prev.images, ...newFiles] }));
        }
    };

    const getLocation = () => {
        if (navigator.geolocation) {
            setUploadStatus('Getting location...');
            navigator.geolocation.getCurrentPosition(async (position) => {
                console.log(position);
                // Mocking reverse geocoding for now
                // In real app, call a geocoding API here using position.coords.latitude
                setFormData(prev => ({ ...prev, city: "Detected City" }));
                setUploadStatus('');
            }, (err) => {
                alert("Could not get location. Please enter manually."+err);
                setUploadStatus('');
            });
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setUploadStatus('Authenticating...');

        const token = await getAuthToken();

        if (!token) {
            alert("Session expired. Please login again.");
            router.push('/login');
            return;
        }

        setUploadStatus('Preparing data...');

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('product_type', formData.product_type);
        data.append('visibility', formData.visibility);
        data.append('is_digital', String(formData.is_digital));

        // Conditional Fields
        if (!['lost', 'found'].includes(formData.product_type)) {
            data.append('price', formData.price);
        }
        if (!formData.is_digital) {
            data.append('city', formData.city);
        }
        if (formData.category_name) {
            data.append('new_category_name', formData.category_name);
        }

        // Images
        setUploadStatus('Uploading images...');
        formData.images.forEach((file) => {
            data.append('files', file);
        });

        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            // Assuming you have the cookie handling set up to pass credentials
            // Or relying on a proxy. If direct fetch, ensure credentials: 'include' logic

            // Note: Since this is Client Side, we rely on the browser cookie if 'include' is set
            // OR we pass the token if stored in local storage. 
            // For this example, assuming you have a way to proxy or the cookie is httpOnly (SameSite).

            // Since it's a multipart form, we usually use fetch directly or axios
            // If you are using the Server Action approach from before, you'd wrap this in an action.
            // But for "Uploading status" feedback, client-side fetch is often better.

            // Let's assume we call a Next.js API route that proxies, OR direct if CORS allowed.
            // Here is direct fetch example (Requires Backend CORS setup):
            const res = await fetch(`${backendUrl}/api/products/`, {
                method: 'POST',
                body: data,
                headers: {
                    // DO NOT set 'Content-Type': 'multipart/form-data' manually!
                    // The browser must set it to include the "boundary"
                    'Authorization': `Bearer ${token}` // <--- THIS WAS MISSING
                }
            });

            if (res.ok) {
                setUploadStatus('Product Live!');
                setTimeout(() => router.push('/dashboard'), 1000);
            } else {
                const errData = await res.json() as { detail?: string | Array<{ msg: string }> };
                let errorMessage = 'Failed to create';

                if (typeof errData.detail === 'string') {
                    errorMessage = errData.detail;
                } else if (Array.isArray(errData.detail)) {
                    errorMessage = errData.detail[0]?.msg || errorMessage;
                }

                alert(`Error: ${errorMessage}`);
                setLoading(false);
            }
        } catch (e) {
            console.error(e);
            alert('Something went wrong');
            setLoading(false);
        }
    };

    // --- Animation Variants ---
    // const slideVariants = {
    //     enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    //     center: { x: 0, opacity: 1 },
    //     exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 }),
    // };

    // --- Helper to determine skip logic ---
    const isLostFound = ['lost', 'found'].includes(formData.product_type);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
            {/* Progress Bar */}
            <div className="w-full max-w-md mb-8 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / 6) * 100}%` }}
                />
            </div>

            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col relative">
                <AnimatePresence mode="wait" custom={step}>

                    {/* STEP 1: TYPE SELECT */}
                    {step === 1 && (
                        <motion.div key="step1" {...animProps} className="p-6 flex-1 flex flex-col">
                            <h2 className="text-2xl font-bold mb-6 text-center">What are you posting?</h2>
                            <div className="grid gap-3">
                                {PRODUCT_TYPES.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            setFormData({ ...formData, product_type: t.id });
                                            handleNext();
                                        }}
                                        className={cn(
                                            "flex items-center p-4 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-95 text-left",
                                            "border-transparent hover:border-zinc-300 dark:hover:border-zinc-700",
                                            t.color
                                        )}
                                    >
                                        <span className="text-2xl mr-4">{t.emoji}</span>
                                        <span className="font-bold text-lg">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: BASIC INFO */}
                    {step === 2 && (
                        <motion.div key="step2" {...animProps} className="p-6 flex-1 flex flex-col">
                            <h2 className="text-2xl font-bold mb-2">The Basics</h2>
                            <p className="text-muted-foreground mb-6">Give your item a catchy title.</p>

                            <div className="space-y-4 flex-1">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Blue Engineering Calculator"
                                        className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Category</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Electronics, Books"
                                        className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={formData.category_name}
                                        onChange={e => setFormData({ ...formData, category_name: e.target.value })}
                                    />
                                </div>

                                {!isLostFound && (
                                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_digital}
                                            onChange={e => setFormData({ ...formData, is_digital: e.target.checked })}
                                            className="w-5 h-5 accent-primary"
                                        />
                                        <div>
                                            <span className="font-semibold block">This is a Digital Item</span>
                                            <span className="text-xs text-muted-foreground">PDFs, Notes, Software (No location needed)</span>
                                        </div>
                                    </label>
                                )}
                            </div>
                            <NavButtons onNext={handleNext} onBack={handleBack} disabled={!formData.title} />
                        </motion.div>
                    )}

                    {/* STEP 3: DETAILS */}
                    {step === 3 && (
                        <motion.div key="step3" {...animProps} className="p-6 flex-1 flex flex-col">
                            <h2 className="text-2xl font-bold mb-2">Details</h2>
                            <p className="text-muted-foreground mb-6">Describe it properly.</p>

                            <div className="space-y-4 flex-1">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Description</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Condition, reason for selling, specific location details..."
                                        className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                {!isLostFound && (
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Price (₹)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full pl-10 p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary outline-none transition-all"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <NavButtons onNext={handleNext} onBack={handleBack} disabled={!formData.description} />
                        </motion.div>
                    )}

                    {/* STEP 4: IMAGES */}
                    {step === 4 && (
                        <motion.div key="step4" {...animProps} className="p-6 flex-1 flex flex-col">
                            <h2 className="text-2xl font-bold mb-2">Photos</h2>
                            <p className="text-muted-foreground mb-6">Show off what you have.</p>

                            <div className="flex-1">
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {formData.images.map((file, i) => (
                                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-100">
                                            <Image src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                        </div>
                                    ))}

                                    {formData.images.length < 5 && (
                                        <label className="aspect-square rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                            <span className="text-xs text-muted-foreground">Add Photo</span>
                                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                                        </label>
                                    )}
                                </div>
                                <p className="text-xs text-center text-muted-foreground">Max 5 images. Keep it clean (NSFW filtered).</p>
                            </div>
                            <NavButtons onNext={handleNext} onBack={handleBack} disabled={formData.images.length === 0} />
                        </motion.div>
                    )}

                    {/* STEP 5: LOCATION (Skipped if Digital) */}
                    {step === 5 && (
                        formData.is_digital ? (
                            // Auto-skip if digital
                            (() => { handleNext(); return null; })()
                        ) : (
                            <motion.div key="step5" {...animProps} className="p-6 flex-1 flex flex-col">
                                <h2 className="text-2xl font-bold mb-2">Location</h2>
                                <p className="text-muted-foreground mb-6">Where is this item?</p>

                                <div className="flex-1 space-y-4">
                                    <button
                                        onClick={getLocation}
                                        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100 transition-colors"
                                    >
                                        <MapPin className="w-5 h-5" />
                                        Use Current Location
                                    </button>

                                    <div className="relative flex items-center py-2">
                                        <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Or type manual</span>
                                        <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1 block">City / Campus</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Hyderabad, IIT Campus"
                                            className="w-full p-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary outline-none transition-all"
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <NavButtons onNext={handleNext} onBack={handleBack} disabled={!formData.city} />
                            </motion.div>
                        )
                    )}

                    {/* STEP 6: VISIBILITY */}
                    {step === 6 && (
                        <motion.div key="step6" {...animProps} className="p-6 flex-1 flex flex-col">
                            <h2 className="text-2xl font-bold mb-2">Who sees this?</h2>
                            <p className="text-muted-foreground mb-6">Control your privacy.</p>

                            <div className="flex-1 space-y-3">
                                {VISIBILITY_OPTIONS.map((opt) => (
                                    <label
                                        key={opt.id}
                                        className={cn(
                                            "flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all",
                                            formData.visibility === opt.id
                                                ? "border-primary bg-primary/5"
                                                : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-300"
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="visibility"
                                            value={opt.id}
                                            checked={formData.visibility === opt.id}
                                            onChange={e => setFormData({ ...formData, visibility: e.target.value })}
                                            className="w-5 h-5 accent-primary mr-4"
                                        />
                                        <div>
                                            <span className="font-bold block">{opt.label}</span>
                                            <span className="text-xs text-muted-foreground">{opt.desc}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {uploadStatus}
                                        </>
                                    ) : (
                                        <>
                                            Post it! <CheckCircle2 className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>

                            <button onClick={handleBack} className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground">
                                Back
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}

// --- Components & Props ---

const animProps = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.2 }
};

function NavButtons({ onNext, onBack, disabled }: { onNext: () => void, onBack: () => void, disabled: boolean }) {
    return (
        <div className="mt-6 flex gap-3">
            <button
                onClick={onBack}
                className="px-6 py-3 rounded-xl border font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <button
                onClick={onNext}
                disabled={disabled}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                Continue <ArrowRight className="w-5 h-5" />
            </button>
        </div>
    );
}