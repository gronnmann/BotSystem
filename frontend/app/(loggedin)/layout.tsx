"use client"
import LoadingScreen from "@/components/loading-screen";
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"; // Changed from next/router
import React, { useEffect } from "react";
import ProfileSetupDialog from "@/components/members/profile-setup-dialog";

export default function LoggedInLayout({children}: {children: React.ReactNode}) {
    const {user, profileLoading, loading, profile} = useAuth();
    const router = useRouter();

    const [profileDialogOpen, setProfileDialogOpen] = React.useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, router, loading]);

    // Show loading state while checking auth or redirecting
    if (loading || profileLoading) {
        return <LoadingScreen text="Sjekker innlogging..." />;
    }

    if (!profile) {
        return <>
            <ProfileSetupDialog open={profileDialogOpen} onOpenChange={() => {
                setProfileDialogOpen(true); // Keep it open until profile is set up
            }} />
            {children}
        </>
    }

    return <>{children}</>;
}
