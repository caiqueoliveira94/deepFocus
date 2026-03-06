"use client"

import Link from "next/link"
import { AuthDialog } from "./auth-dialog"
import { ThemeToggle } from "./theme-toggle"
import { ArrowLeft } from "lucide-react"
import { Button } from "./ui/button"

interface HeaderProps {
    showBack?: boolean
    title?: string
}

export function Header({ showBack, title }: HeaderProps) {
    return (
        <header className="w-full border-b border-border/50 bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60 z-10 shrink-0">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {showBack && (
                        <Link href="/" className="mr-1">
                            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                                <ArrowLeft className="h-5 w-5" />
                                <span className="sr-only">Voltar</span>
                            </Button>
                        </Link>
                    )}

                    <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
                        <h1 className="text-2xl font-bold text-foreground tracking-tighter">
                            deep<span className="text-accent font-medium">Focus</span>
                        </h1>
                    </Link>

                    {title ? (
                        <>
                            <div className="h-4 w-px bg-border" />
                            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                                {title}
                            </h2>
                        </>
                    ) : (
                        <>
                            <div className="hidden sm:block h-4 w-px bg-border" />
                            <p className="hidden sm:block text-sm text-muted-foreground uppercase tracking-widest font-medium">
                                Foco e produtividade
                            </p>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <AuthDialog />
                </div>
            </div>
        </header>
    )
}
