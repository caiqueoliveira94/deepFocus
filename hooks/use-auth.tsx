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
    isAuthenticating: boolean
    login: (email: string, password: string) => Promise<{ error: any }>
    register: (name: string, email: string, password: string) => Promise<{ error: any }>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticating, setIsAuthenticating] = useState(false)

    const mapUser = (supabaseUser: SupabaseUser | null): User | null => {
        if (!supabaseUser) return null
        return {
            id: supabaseUser.id,
            email: supabaseUser.email!,
            name: supabaseUser.user_metadata?.name || supabaseUser.email!.split("@")[0],
        }
    }

    useEffect(() => {
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
        setIsAuthenticating(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        setIsAuthenticating(false)

        if (error) {
            let message = error.message

            if (error.message === "Invalid login credentials") {
                message = "E-mail ou senha incorretos."
            } else if (error.message === "Email not confirmed") {
                message = "Para entrar, você precisa confirmar seu e-mail."
            } else if (error.message === "Database error saving new user") {
                message = "Houve um erro no servidor. Tente novamente mais tarde."
            }

            return { error: { ...error, message } }
        }

        return { error }
    }, [])

    const register = useCallback(async (name: string, email: string, password: string) => {
        setIsAuthenticating(true)

        if (!email.includes("@")) {
            setIsAuthenticating(false)
            return { error: { message: "E-mail inválido." } }
        }

        if (password.length < 6) {
            setIsAuthenticating(false)
            return { error: { message: "A senha deve ter pelo menos 6 caracteres." } }
        }

        try {
            const { data: existingProfile, error: checkError } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', email)
                .maybeSingle()

            if (existingProfile) {
                setIsAuthenticating(false)
                return { error: { message: "Este e-mail já está em uso." } }
            }

            if (checkError && checkError.code !== 'PGRST116' && checkError.code !== '42P01') {
                console.warn("Erro ao verificar usuário existente:", checkError)
            }
        } catch (err) {
            console.error("Erro na pré-verificação de cadastro:", err)
        }

        const { error, data } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
            },
        })

        if (!error && data?.user && data.user.identities?.length === 0) {
            setIsAuthenticating(false)
            return { error: { message: "Este e-mail já está cadastrado. Tente fazer login." } }
        }

        setIsAuthenticating(false)
        return { error }
    }, [])

    const logout = useCallback(async () => {
        await supabase.auth.signOut()
        setUser(null)
    }, [])

    const contextValue = React.useMemo(() => ({
        user,
        isLoading,
        isAuthenticating,
        login,
        register,
        logout
    }), [user, isLoading, isAuthenticating, login, register, logout])

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
