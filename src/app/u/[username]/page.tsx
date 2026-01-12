import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, School, Calendar, ShieldCheck } from "lucide-react";

interface PublicProfile {
    username: string;
    name: string;
    college: string; 
    picture?: string;
}

// Server Component for fetching data
async function getPublicProfile(username: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/u/${username}`, {
        cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicProfile;
}

// FIX: params is now a Promise<{ username: string }>
export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
    // 1. Await the params to get the actual data
    const resolvedParams = await params;
    
    // 2. Use the resolved username
    const profile = await getPublicProfile(resolvedParams.username);

    if (!profile) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-10">
            <div className="container max-w-5xl mx-auto px-4">

                {/* Header Section */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-900 overflow-hidden bg-zinc-200">
                                    <Image
                                        src={profile.picture || "/placeholder-avatar.png"}
                                        alt={profile.name}
                                        width={96}
                                        height={96}
                                        className="object-cover"
                                    />
                                </div>
                                <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></div>
                            </div>
                            <div className="flex gap-2">
                                <Button>Message</Button>
                            </div>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                {profile.name}
                                {profile.college !== "Unverified" && (
                                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                                )}
                            </h1>
                            <p className="text-muted-foreground">@{profile.username}</p>

                            <div className="flex flex-wrap gap-4 mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                                <div className="flex items-center gap-1">
                                    <School className="w-4 h-4" />
                                    <span>{profile.college}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>Campus Resident</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Joined 2024</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <Tabs defaultValue="listings" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8">
                        <TabsTrigger value="listings">Active Listings</TabsTrigger>
                        <TabsTrigger value="about">About</TabsTrigger>
                    </TabsList>

                    <TabsContent value="listings">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            <EmptyState message="No active listings found." />
                        </div>
                    </TabsContent>

                    <TabsContent value="about">
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-zinc-600 dark:text-zinc-400">
                                    This user hasn&apos;t written a bio yet.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

            </div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <School className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-zinc-500 font-medium">{message}</p>
        </div>
    )
}