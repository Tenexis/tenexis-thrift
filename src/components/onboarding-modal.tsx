'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthToken } from '@/app/actions/get-token';
import { Check, ChevronsUpDown, Loader2, ArrowLeft, School, User, GraduationCap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { updateSessionToken, UserProfile } from "@/app/actions/auth";

// --- Types based on your API response ---
// API returns: [{"name":"MRCE","slug":"mrce","domain":"mrce.in","logo_url":"MRCE"}]
interface College {
    name: string;
    slug: string;
    city?: string;
}

export function OnboardingModal({ user }: { user: UserProfile | null }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [step, setStep] = useState(1);

    // State
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(10);

    // Form Data
    const [phone, setPhone] = useState(user?.phone_number || "");
    const [otp, setOtp] = useState("");
    const [gender, setGender] = useState(user?.gender || "");
    const [officialName, setOfficialName] = useState(user?.official_name || "");
    const [rollNumber, setRollNumber] = useState(user?.roll_number || "");

    // College Search
    const [collegeOpen, setCollegeOpen] = useState(false);
    // Initialize selected college if user already has one (mapped via slug)
    const [selectedCollege, setSelectedCollege] = useState<College | null>(
        user?.college ? { name: user.college.name, slug: user.college.slug, city: user.college.city } : null
    );
    const [colleges, setColleges] = useState<College[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // 1. Check if Onboarding is needed
    useEffect(() => {
        if (!user) return;

        const isIncomplete =
            !user.is_phone_verified ||
            !user.gender ||
            // !user.official_name ||
            !user.roll_number ||
            !user.college; // College is mandatory

        if (isIncomplete) {
            let initialStep = 1;
            if (!user.is_phone_verified) initialStep = 1;
            else if (!user.gender) initialStep = 3;
            else initialStep = 4; // Final Step: Details + College

            setOpen(true);
            setStep(initialStep);
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
                setStep(2);
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
                setStep(3);
                setProgress(60);
            } else throw new Error();
        } catch { alert("Invalid OTP"); } finally { setLoading(false); }
    };

    const handleFinalSubmit = async () => {
        setLoading(true);
        console.log({
                phone_number: phone,
                gender: gender,
                official_name: officialName,
                roll_number: rollNumber,
                college_slug: selectedCollege?.slug // Using Slug instead of ID
            });
        try {
            if (!selectedCollege) {
                alert("Please select your college");
                return;
            }

            const payload = {
                phone_number: phone,
                gender: gender,
                official_name: officialName,
                roll_number: rollNumber,
                college_slug: selectedCollege.slug // Using Slug instead of ID
            };

            console.log(payload);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/onboarding`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            console.log(res.ok);
            
            if (res.ok) {
                interface OnboardingResponse {
                    access_token: string;
                    token_type: string;
                    user: UserProfile;
                }
                const responseData = (await res.json()) as OnboardingResponse;
                console.log(responseData);
                if (responseData.access_token) {
                    await updateSessionToken(responseData.access_token);
                }

                setOpen(false);
                router.refresh();
            } else {
                throw new Error("Submission failed");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong saving your profile.");
        } finally {
            setLoading(false);
        }
    };

    const animVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0 [&>button]:hidden">
                <div className="p-6 pb-2">
                    <div className="flex items-center gap-4 mb-4">
                        {step > 1 && (
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
                                    <DialogDescription>Helps us show relevant Lost & Found items.</DialogDescription>
                                </DialogHeader>
                                <div className="flex-1 space-y-3">
                                    {['Male', 'Female', 'Other'].map((g) => (
                                        <button key={g} onClick={() => { setGender(g); setStep(4); setProgress(90); }}
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

                        {/* STEP 4: DETAILS & COLLEGE (Combined) */}
                        {step === 4 && (
                            <motion.div key="step4" variants={animVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 flex flex-col">
                                <DialogHeader className="mb-4">
                                    <DialogTitle className="text-2xl font-bold">Final Steps</DialogTitle>
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

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium ml-1">College</label>
                                        <Popover open={collegeOpen} onOpenChange={setCollegeOpen}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" role="combobox" className="w-full h-11 justify-between px-3 font-normal text-lg">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <GraduationCap className="w-5 h-5" />
                                                        <span className={cn("text-foreground", !selectedCollege && "text-muted-foreground")}>
                                                            {selectedCollege ? selectedCollege.name : "Select your campus"}
                                                        </span>
                                                    </div>
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
                                                                <CommandItem
                                                                    key={college.slug} // Using slug as Key since ID is missing
                                                                    value={college.name}
                                                                    onSelect={() => {
                                                                        setSelectedCollege(college);
                                                                        setCollegeOpen(false);
                                                                    }}
                                                                >
                                                                    <Check className={cn("mr-2 h-4 w-4", selectedCollege?.slug === college.slug ? "opacity-100" : "opacity-0")} />
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
                                </div>

                                <Button
                                    className="w-full h-12 text-lg mt-6 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleFinalSubmit}
                                    disabled={!officialName || !rollNumber || !selectedCollege || loading}
                                >
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