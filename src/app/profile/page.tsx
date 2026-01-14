'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/app/actions/get-token';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    Loader2, Save, User as UserIcon, Phone, GraduationCap,
    ShieldCheck, ShieldAlert, ExternalLink
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// 1. Updated Interface to match your JSON
interface UserData {
    name: string;
    username: string;
    email: string;
    picture?: string;
    official_name?: string;
    phone_number?: string;
    roll_number?: string;
    gender?: string;
    is_college_verified: boolean; // Added this
    college?: {
        name: string;
    };
}

// Replace with your actual WhatsApp number
const TENEXIS_WHATSAPP = "919100474412";

export default function ProfileSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);

    const [formData, setFormData] = useState({
        official_name: '',
        phone_number: '',
        roll_number: '',
        gender: '',
    });

    useEffect(() => {
        async function fetchProfile() {
            const token = await getAuthToken();
            if (!token) return router.push('/login');

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = (await res.json()) as UserData;
                    setUser(data);
                    setFormData({
                        official_name: data.official_name || '',
                        phone_number: data.phone_number || '',
                        roll_number: data.roll_number || '',
                        gender: data.gender || '',
                    });
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [router]);

    const handleSave = async () => {
        setSaving(true);
        const token = await getAuthToken();

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me/complete-profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert("Profile updated!");
                router.refresh();
                const updatedUser = (await res.json()) as UserData;
                setUser(updatedUser);
            } else {
                alert("Failed to update.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    // WhatsApp Link Generator
    const waLink = `https://wa.me/${TENEXIS_WHATSAPP}?text=Hi Team Tenexis, I want to verify my student account.%0A%0AUsername: ${user?.username}%0ARoll Number: ${formData.roll_number}%0A%0A(Attach ID Card Photo Here)`;

    return (
        <div className="container max-w-3xl mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and college identity.</p>
            </div>

            <Separator className="my-6" />

            {/* --- PROFILE HEADER --- */}
            <div className="flex flex-col md:flex-row gap-6 mb-10 items-center md:items-start bg-card border rounded-xl p-6 shadow-sm">
                <Avatar className="w-24 h-24 border-4 border-background shadow-md">
                    <AvatarImage src={user?.picture} />
                    <AvatarFallback className="text-2xl font-bold">{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left space-y-2">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <h2 className="text-2xl font-bold">{user?.name}</h2>
                        {user?.is_college_verified ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                <ShieldCheck className="mr-1 h-3 w-3" /> Verified
                            </span>
                        ) : (
                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                <ShieldAlert className="mr-1 h-3 w-3" /> Unverified
                            </span>
                        )}
                    </div>

                    <p className="text-muted-foreground">@{user?.username} • {user?.email}</p>

                    <div className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        {user?.college?.name || "No College Linked"}
                    </div>
                </div>
            </div>

            {/* --- VERIFICATION ALERT (Only if Unverified) --- */}
            {!user?.is_college_verified && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
                        <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertTitle className="text-blue-800 dark:text-blue-300 font-bold mb-2">Get Verified Badge</AlertTitle>
                        <AlertDescription className="text-blue-700 dark:text-blue-400">
                            <p className="mb-3 text-sm">
                                To unlock all features and get the blue checkmark, verify your identity by sending a photo of your College ID Card to our support team.
                            </p>
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white gap-2"
                                onClick={() => window.open(waLink, '_blank')}
                            >
                                <Phone className="w-3 h-3" /> Verify on WhatsApp <ExternalLink className="w-3 h-3" />
                            </Button>
                        </AlertDescription>
                    </Alert>
                </motion.div>
            )}

            {/* --- FORM SECTION --- */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Official Name (As per ID)</Label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                value={formData.official_name}
                                onChange={e => setFormData({ ...formData, official_name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                className="pl-9 bg-muted/50"
                                value={formData.phone_number}
                                readOnly // Phone usually verified via OTP, so read-only here
                                disabled
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Roll Number</Label>
                        <div className="relative">
                            <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                value={formData.roll_number}
                                onChange={e => setFormData({ ...formData, roll_number: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Gender</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.gender}
                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                {/* Warning Box */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 p-4 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        ⚠️ <strong>Important:</strong> Changing your Roll Number will require re-verification of your account.
                    </p>
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={saving} className="min-w-[140px] font-semibold">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>

            </motion.div>
        </div>
    )
}