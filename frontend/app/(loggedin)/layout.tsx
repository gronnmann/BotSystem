"use client"

import { useAuth } from "@/contexts/auth-context"
import router from "next/router";

export default function LoggedInLayout({children}: {children: React.ReactNode}) {
    const {user} = useAuth();

    if (!user) {
          router.push("/login");
    }

    return children;
}