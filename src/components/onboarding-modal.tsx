'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthToken } from '@/app/actions/get-token';
import { Check, ChevronsUpDown, Loader2, ArrowLeft, School, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { UserProfile } from "@/app/actions/auth";

// --- Types based on your API response ---
interface College {
    id: number;
    name: string;
    city?: string;
    slug?: string;
}

export function OnboardingModal({ user }: { user: UserProfile | null }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    // Logic to determine initial step
    const getInitialStep = () => {
        if (!user) return 1;
        if (!user.is_phone_verified) return 1;
        if (!user.gender) return 3; // Skip OTP (2)
        if (!user.official_name || !user.roll_number) return 4;
        if (!user.college) return 5;
        return 6; // Done
    };

    const [step, setStep] = useState(1);

    // State
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(10);

    // Form Data (Pre-fill if user has some data)
    const [phone, setPhone] = useState(user?.phone_number || "");
    const [otp, setOtp] = useState("");
    const [gender, setGender] = useState(user?.gender || "");
    const [officialName, setOfficialName] = useState(user?.official_name || "");
    const [rollNumber, setRollNumber] = useState(user?.roll_number || "");

    // College Search
    const [collegeOpen, setCollegeOpen] = useState(false);
    const [selectedCollege, setSelectedCollege] = useState<College | null>(user?.college || null);
    const [colleges, setColleges] = useState<College[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // 1. Check if Onboarding is needed on mount
    useEffect(() => {
        if (!user) return;

        // Condition: Missing ANY required field
        const isIncomplete =
            !user.is_phone_verified ||
            !user.gender ||
            // !user.official_name ||
            !user.roll_number ||
            !user.college;

        if (isIncomplete) {
            setOpen(true);
            setStep(getInitialStep());
            getAuthToken().then((t) => setToken(t || null));
        }
    }, [user]);

    // 2. Debounced College Search
    useEffect(() => {
        const fetchColleges = async () => {
            if (searchQuery.length < 2) return;
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/colleges/search?q=${searchQuery}`);
                if (res.ok) {
                    const data = (await res.json()) as College[];
                    setColleges(data);
                }
            } catch (error) { console.error(error); }
        };
        const t = setTimeout(fetchColleges, 300);
        return () => clearTimeout(t);
    }, [searchQuery]);

    // --- Actions ---
    const handleSendOTP = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ phone_number: phone })
            });
            if (res.ok) {
                setStep(2); // Go to OTP
                setProgress(30);
            } else throw new Error();
        } catch { alert("Error sending OTP"); } finally { setLoading(false); }
    };

    const handleVerifyOTP = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ phone_number: phone, code: otp })
            });
            if (res.ok) {
                setStep(3); // Go to Gender
                setProgress(50);
            } else throw new Error();
        } catch { alert("Invalid OTP"); } finally { setLoading(false); }
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
                setOpen(false);
                router.refresh(); // Refresh Server Components to reflect new data
            } else throw new Error();
        } catch { alert("Submission failed"); } finally { setLoading(false); }
    };

    // --- Render Helpers ---
    const animVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            {/* Empty onOpenChange prevents closing by clicking outside/ESC */}
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0 [&>button]:hidden">
                {/* [&>button]:hidden removes the 'X' close button */}

                <div className="p-6 pb-2">
                    <div className="flex items-center gap-4 mb-4">
                        {step > 1 && step !== getInitialStep() && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setStep(s => s - 1)}>
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        )}
                        <Progress value={progress} className="h-2 flex-1" />
                    </div>
                </div>

                <div className="p-6 pt-0 min-h-[400px] flex flex-col">
                    <AnimatePresence mode="wait">

                        {/* STEP 1: PHONE */}
                        {step === 1 && (
                            <motion.div key="step1" variants={animVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 flex flex-col">
                                <DialogHeader className="mb-6">
                                    <DialogTitle className="text-2xl font-bold">What&apos;s your number?</DialogTitle>
                                    <DialogDescription>We verify every student to keep the campus safe.</DialogDescription>
                                </DialogHeader>
                                <div className="flex-1 space-y-6">
                                    <div className="flex gap-2 items-center border rounded-xl p-3 bg-muted/30">
                                        <span className="text-lg font-medium text-muted-foreground">🇮🇳 +91</span>
                                        <Input className="border-0 shadow-none focus-visible:ring-0 text-lg bg-transparent"
                                            placeholder="98765 43210" value={phone} onChange={e => setPhone(e.target.value)} autoFocus />
                                    </div>
                                </div>
                                <Button className="w-full h-12 text-lg mt-6" onClick={handleSendOTP} disabled={phone.length < 10 || loading}>
                                    {loading ? <Loader2 className="animate-spin" /> : "Send Code"}
                                </Button>
                            </motion.div>
                        )}

                        {/* STEP 2: OTP */}
                        {step === 2 && (
                            <motion.div key="step2" variants={animVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 flex flex-col">
                                <DialogHeader className="mb-6 text-center">
                                    <DialogTitle className="text-2xl font-bold">Enter the code</DialogTitle>
                                    <DialogDescription>Sent to +91 {phone}</DialogDescription>
                                </DialogHeader>
                                <div className="flex-1 flex justify-center items-center">
                                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} className="h-12 w-10 text-lg" />
                                            <InputOTPSlot index={1} className="h-12 w-10 text-lg" />
                                            <InputOTPSlot index={2} className="h-12 w-10 text-lg" />
                                        </InputOTPGroup>
                                        <div className="w-4"></div>
                                        <InputOTPGroup>
                                            <InputOTPSlot index={3} className="h-12 w-10 text-lg" />
                                            <InputOTPSlot index={4} className="h-12 w-10 text-lg" />
                                            <InputOTPSlot index={5} className="h-12 w-10 text-lg" />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                                <Button className="w-full h-12 text-lg mt-6" onClick={handleVerifyOTP} disabled={otp.length < 6 || loading}>
                                    {loading ? <Loader2 className="animate-spin" /> : "Verify"}
                                </Button>
                            </motion.div>
                        )}

                        {/* STEP 3: GENDER */}
                        {step === 3 && (
                            <motion.div key="step3" variants={animVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 flex flex-col">
                                <DialogHeader className="mb-6">
                                    <DialogTitle className="text-2xl font-bold">Which dorm?</DialogTitle>
                                    <DialogDescription>Helps us show relevant Lost & Found items (e.g. inside Girls Hostel).</DialogDescription>
                                </DialogHeader>
                                <div className="flex-1 space-y-3">
                                    {['Male', 'Female', 'Other'].map((g) => (
                                        <button key={g} onClick={() => { setGender(g); setStep(4); setProgress(70); }}
                                            className={cn("w-full p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50 flex justify-between items-center",
                                                gender === g ? "border-primary bg-primary/5" : "border-muted"
                                            )}>
                                            <span className="font-semibold text-lg">{g}</span>
                                            {gender === g && <Check className="w-5 h-5 text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: DETAILS */}
                        {step === 4 && (
                            <motion.div key="step4" variants={animVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 flex flex-col">
                                <DialogHeader className="mb-6">
                                    <DialogTitle className="text-2xl font-bold">Student Details</DialogTitle>
                                    <DialogDescription>Enter details exactly as they appear on your ID Card.</DialogDescription>
                                </DialogHeader>
                                <div className="flex-1 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium ml-1">Official Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                            <Input className="pl-10 h-11" placeholder="John Doe" value={officialName} onChange={e => setOfficialName(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium ml-1">Roll Number</label>
                                        <div className="relative">
                                            <School className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                            <Input className="pl-10 h-11" placeholder="21BCE..." value={rollNumber} onChange={e => setRollNumber(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full h-12 text-lg mt-6" onClick={() => { setStep(5); setProgress(90); }} disabled={!officialName || !rollNumber}>
                                    Continue
                                </Button>
                            </motion.div>
                        )}

                        {/* STEP 5: COLLEGE */}
                        {step === 5 && (
                            <motion.div key="step5" variants={animVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 flex flex-col">
                                <DialogHeader className="mb-6">
                                    <DialogTitle className="text-2xl font-bold">Your Campus</DialogTitle>
                                    <DialogDescription>Select where you study to join your campus marketplace.</DialogDescription>
                                </DialogHeader>
                                <div className="flex-1">
                                    <Popover open={collegeOpen} onOpenChange={setCollegeOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" className="w-full h-14 justify-between text-lg px-4">
                                                {selectedCollege ? selectedCollege.name : "Search college..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0" align="start">
                                            <Command shouldFilter={false}>
                                                <CommandInput placeholder="Type college name..." value={searchQuery} onValueChange={setSearchQuery} />
                                                <CommandList>
                                                    <CommandEmpty>No college found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {colleges.map((college) => (
                                                            <CommandItem key={college.id} value={college.name} onSelect={() => { setSelectedCollege(college); setCollegeOpen(false); }}>
                                                                <Check className={cn("mr-2 h-4 w-4", selectedCollege?.id === college.id ? "opacity-100" : "opacity-0")} />
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
                                </div>
                                <Button className="w-full h-12 text-lg mt-6 bg-green-600 hover:bg-green-700" onClick={handleFinalSubmit} disabled={!selectedCollege || loading}>
                                    {loading ? <Loader2 className="animate-spin" /> : "Complete Setup"}
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}