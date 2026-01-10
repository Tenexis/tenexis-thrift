'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthToken } from '@/app/actions/get-token';
import { Check, ChevronsUpDown, Loader2, ArrowLeft, School, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// --- Types ---
interface College {
    id: number;
    name: string;
    city?: string;
}

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [progress, setProgress] = useState(10);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    // Form Data
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [gender, setGender] = useState("");
    const [officialName, setOfficialName] = useState("");
    const [rollNumber, setRollNumber] = useState("");

    // College Search State
    const [collegeOpen, setCollegeOpen] = useState(false);
    const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
    const [colleges, setColleges] = useState<College[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // 1. Fetch Token on Mount
    useEffect(() => {
        getAuthToken().then((t) => {
            if (!t) router.push('/login');
            setToken(t || null);
        });
    }, [router]);

    // 2. Debounced College Search
    useEffect(() => {
        const fetchColleges = async () => {
            if (searchQuery.length < 2) return;
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/colleges/search?q=${searchQuery}`);
                if (res.ok) {
                    // FIX: Cast the JSON response to College[]
                    const data = (await res.json()) as College[];
                    setColleges(data);
                }
            } catch (error) {
                console.error("Search failed", error);
            }
        };
        const timeoutId = setTimeout(fetchColleges, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // --- API ACTIONS ---

    const handleSendOTP = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ phone_number: phone })
            });
            if (!res.ok) throw new Error("Failed to send OTP");
            nextStep();
        } catch (e) {
            alert("Error sending OTP. Try again."+e);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ phone_number: phone, code: otp })
            });
            if (!res.ok) throw new Error("Invalid OTP");
            nextStep();
        } catch (e) {
            alert("Invalid Code."+e);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/onboarding`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    phone_number: phone,
                    gender: gender,
                    official_name: officialName,
                    roll_number: rollNumber,
                    college_id: selectedCollege?.id
                })
            });

            if (res.ok) {
                router.push('/dashboard');
            } else {
                throw new Error("Submission failed");
            }
        } catch (e) {
            alert("Something went wrong saving your profile."+e);
        } finally {
            setLoading(false);
        }
    };

    // --- Navigation Helpers ---
    const nextStep = () => {
        setStep(s => s + 1);
        setProgress(p => p + 20);
    };

    const prevStep = () => {
        setStep(s => s - 1);
        setProgress(p => p - 20);
    };

    const animVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 max-w-lg mx-auto">

            {/* Top Bar */}
            <div className="w-full flex items-center gap-4 mb-8">
                {step > 1 && (
                    <Button variant="ghost" size="icon" onClick={prevStep}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                )}
                <Progress value={progress} className="h-3 rounded-full flex-1" />
            </div>

            <div className="w-full flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">

                    {/* STEP 1: PHONE NUMBER */}
                    {step === 1 && (
                        <motion.div key="step1" variants={animVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                            <div className="space-y-2 text-center">
                                <h1 className="text-3xl font-extrabold tracking-tight">What&apos;s your number?</h1>
                                <p className="text-muted-foreground">We need this to verify you are a real student.</p>
                            </div>

                            <div className="flex gap-2 items-center border rounded-xl p-2 bg-card shadow-sm">
                                <span className="pl-3 text-lg font-medium text-muted-foreground">🇮🇳 +91</span>
                                <Input
                                    className="border-0 shadow-none focus-visible:ring-0 text-lg tracking-wide"
                                    placeholder="98765 43210"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <Button
                                className="w-full h-12 text-lg font-bold rounded-xl"
                                onClick={handleSendOTP}
                                disabled={phone.length < 10 || loading}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Send Code"}
                            </Button>
                        </motion.div>
                    )}

                    {/* STEP 2: OTP */}
                    {step === 2 && (
                        <motion.div key="step2" variants={animVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6 flex flex-col items-center">
                            <div className="space-y-2 text-center">
                                <h1 className="text-3xl font-extrabold">Enter the code</h1>
                                <p className="text-muted-foreground">Sent to +91 {phone}</p>
                            </div>

                            <InputOTP maxLength={6} value={otp} onChange={(val) => setOtp(val)}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} className="h-14 w-12 text-xl" />
                                    <InputOTPSlot index={1} className="h-14 w-12 text-xl" />
                                    <InputOTPSlot index={2} className="h-14 w-12 text-xl" />
                                </InputOTPGroup>
                                <div className="w-4"></div>
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} className="h-14 w-12 text-xl" />
                                    <InputOTPSlot index={4} className="h-14 w-12 text-xl" />
                                    <InputOTPSlot index={5} className="h-14 w-12 text-xl" />
                                </InputOTPGroup>
                            </InputOTP>

                            <Button
                                className="w-full h-12 text-lg font-bold rounded-xl mt-4"
                                onClick={handleVerifyOTP}
                                disabled={otp.length < 6 || loading}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Verify"}
                            </Button>
                        </motion.div>
                    )}

                    {/* STEP 3: GENDER */}
                    {step === 3 && (
                        <motion.div key="step3" variants={animVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                            <div className="space-y-2 text-center">
                                <h1 className="text-3xl font-extrabold">Which dorm?</h1>
                                <p className="text-muted-foreground">Helps us show relevant Lost & Found items.</p>
                            </div>

                            <div className="grid gap-4">
                                {['Male', 'Female', 'Other'].map((g) => (
                                    <button
                                        key={g}
                                        onClick={() => { setGender(g); nextStep(); }}
                                        className={cn(
                                            "p-6 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] active:scale-95 flex justify-between items-center group",
                                            gender === g ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                                        )}
                                    >
                                        <span className="text-xl font-bold">{g}</span>
                                        <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", gender === g ? "border-primary" : "border-muted")}>
                                            {gender === g && <div className="w-3 h-3 bg-primary rounded-full" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: DETAILS */}
                    {step === 4 && (
                        <motion.div key="step4" variants={animVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                            <div className="space-y-2 text-center">
                                <h1 className="text-3xl font-extrabold">Who are you?</h1>
                                <p className="text-muted-foreground">Use your details as they appear on your ID Card.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block ml-1">Official Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            className="pl-10 h-12 rounded-xl text-lg"
                                            placeholder="John Doe"
                                            value={officialName}
                                            onChange={e => setOfficialName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block ml-1">Roll Number</label>
                                    <div className="relative">
                                        <School className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            className="pl-10 h-12 rounded-xl text-lg"
                                            placeholder="21BCE..."
                                            value={rollNumber}
                                            onChange={e => setRollNumber(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 text-lg font-bold rounded-xl"
                                onClick={nextStep}
                                disabled={!officialName || !rollNumber}
                            >
                                Continue
                            </Button>
                        </motion.div>
                    )}

                    {/* STEP 5: COLLEGE SEARCH */}
                    {step === 5 && (
                        <motion.div key="step5" variants={animVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                            <div className="space-y-2 text-center">
                                <h1 className="text-3xl font-extrabold">Where do you study?</h1>
                                <p className="text-muted-foreground">Find your campus to join the marketplace.</p>
                            </div>

                            <Popover open={collegeOpen} onOpenChange={setCollegeOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={collegeOpen}
                                        className="w-full h-14 justify-between text-lg rounded-xl px-4"
                                    >
                                        {selectedCollege ? selectedCollege.name : "Search college..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                    <Command shouldFilter={false}>
                                        {/* Disabled client filter because we search via API */}
                                        <CommandInput
                                            placeholder="Type college name..."
                                            value={searchQuery}
                                            onValueChange={setSearchQuery}
                                        />
                                        <CommandList>
                                            <CommandEmpty>No college found.</CommandEmpty>
                                            <CommandGroup>
                                                {colleges.map((college) => (
                                                    <CommandItem
                                                        key={college.id}
                                                        value={college.name}
                                                        onSelect={() => {
                                                            setSelectedCollege(college);
                                                            setCollegeOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedCollege?.id === college.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span>{college.name}</span>
                                                            {college.city && <span className="text-xs text-muted-foreground">{college.city}</span>}
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            <div className="pt-4">
                                <Button
                                    className="w-full h-14 text-lg font-bold rounded-xl shadow-lg bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleFinalSubmit}
                                    disabled={!selectedCollege || loading}
                                >
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                    Complete Setup
                                </Button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}