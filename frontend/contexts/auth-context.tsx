'use client'

import {createContext, useContext, useEffect, useState, ReactNode} from 'react'
import {User, Session} from '@supabase/supabase-js'
import { supabaseClient} from '@/lib/supabase-client'
import {Tables} from '@/lib/database.types'
import {LoaderCircle} from "lucide-react"
import { useGetProfile } from '@/queries/queries'

interface AuthContextType {
    user: User | null
    session: Session | null
    profile: Tables<'profiles'> | null
    loading: boolean
    profileLoading: boolean
    signOut: () => Promise<void>
    refreshProfile: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({children}: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [authLoading, setAuthLoading] = useState(true)

    // Use the query hook for profile management
    const { 
        data: profile, 
        isLoading: profileLoading, 
        refetch: refreshProfile 
    } = useGetProfile(user?.id || null)

    const signOut = async () => {
        try {
            await supabaseClient.auth.signOut()
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            try {
                const {data: {session: initialSession}} = await supabaseClient.auth.getSession()
                setSession(initialSession)
                setUser(initialSession?.user ?? null)
            } catch (error) {
                console.error('Error getting initial session:', error)
            } finally {
                setAuthLoading(false)
            }
        }

        getInitialSession()
    }, [])

    useEffect(() => {
        const {
            data: {subscription},
        } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            setAuthLoading(false)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const value = {
        user,
        session,
        profile: profile || null,
        loading: authLoading,
        profileLoading,
        signOut,
        refreshProfile: () => refreshProfile(),
    }

    // Show loading spinner while auth is initializing
    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoaderCircle className="animate-spin h-10 w-10 text-purple-500" />
            </div>
        )
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}