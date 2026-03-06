"use client"

import * as React from "react"
import { useState, useEffect, createContext, useContext, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface User {
    id: string
    email: string
    name: string
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<{ error: any }>
    register: (name: string, email: string, password: string) => Promise<{ error: any }>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const mapUser = (supabaseUser: SupabaseUser | null): User | null => {
        if (!supabaseUser) return null
        return {
            id: supabaseUser.id,
            email: supabaseUser.email!,
            name: supabaseUser.user_metadata?.name || supabaseUser.email!.split("@")[0],
        }
    }

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            const newUser = mapUser(session?.user ?? null)
            setUser(prev => {
                if (JSON.stringify(prev) === JSON.stringify(newUser)) return prev
                return newUser
            })
            setIsLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const newUser = mapUser(session?.user ?? null)
            setUser(prev => {
                if (JSON.stringify(prev) === JSON.stringify(newUser)) return prev
                return newUser
            })
            setIsLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        setIsLoading(false)
        return { error }
    }, [])

    const register = useCallback(async (name: string, email: string, password: string) => {
        setIsLoading(true)
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
            },
        })
        setIsLoading(false)
        return { error }
    }, [])

    const logout = useCallback(async () => {
        await supabase.auth.signOut()
        setUser(null)
    }, [])

    const contextValue = React.useMemo(() => ({
        user,
        isLoading,
        login,
        register,
        logout
    }), [user, isLoading, login, register, logout])

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) { throw new Error("useAuth must be used within an AuthProvider") }
    return context
}
