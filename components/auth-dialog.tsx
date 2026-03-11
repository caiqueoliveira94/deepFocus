"use client"

import * as React from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogIn, UserPlus, Loader2, User, LogOut, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export function AuthDialog() {
    const { user, login, register, logout, isLoading, isAuthenticating } = useAuth()
    const { toast } = useToast()
    const [open, setOpen] = React.useState(false)

    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [name, setName] = React.useState("")
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMsg(null)
        const { error } = await login(email, password)
        if (error) {
            setErrorMsg(error.message)
            toast({
                title: "Erro ao entrar",
                description: error.message,
                variant: "destructive"
            })
        } else {
            setOpen(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMsg(null)
        const { error } = await register(name, email, password)
        if (error) {
            setErrorMsg(error.message)
            toast({
                title: "Erro ao cadastrar",
                description: error.message,
                variant: "destructive"
            })
        } else {
            setOpen(false)
            toast({
                title: "Conta criada!",
                description: "Verifique seu email para confirmar o cadastro.",
            })
        }
    }

    if (isLoading) {
        return (
            <div className="h-10 w-24 bg-muted animate-pulse rounded-md" />
        )
    }

    if (user) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-3 p-2 h-auto">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center bg-card text-muted-foreground hover:text-foreground transition-colors">
                            <User className="h-5 w-5" />
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center cursor-pointer w-full">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className=" focus:text-destructive focus:bg-destructive/10 cursor-pointer dark:focus:text-destructive dark:focus:bg-destructive/10">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) setErrorMsg(null)
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    Entrar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <Tabs defaultValue="login" className="w-full">
                    <DialogHeader>
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="login" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground dark:data-[state=active]:bg-accent dark:data-[state=active]:text-accent-foreground">Login</TabsTrigger>
                            <TabsTrigger value="register" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground dark:data-[state=active]:bg-accent dark:data-[state=active]:text-accent-foreground">Cadastro</TabsTrigger>
                        </TabsList>
                        <DialogTitle className="hidden">Autenticação</DialogTitle>
                        <DialogDescription className="hidden">
                            Entre ou crie uma conta para sincronizar seus dados.
                        </DialogDescription>
                    </DialogHeader>

                    <TabsContent value="login">
                        <form onSubmit={handleLogin} className="space-y-4 pt-2">
                            {errorMsg && (
                                <div className="p-3 rounded-md bg-destructive/15 border border-destructive/20 text-destructive text-sm flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                                    <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                                    {errorMsg}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isAuthenticating}>
                                {isAuthenticating ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <LogIn className="h-4 w-4 mr-2" />
                                )}
                                Entrar
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="register">
                        <form onSubmit={handleRegister} className="space-y-4 pt-2">
                            {errorMsg && (
                                <div className="p-3 rounded-md bg-destructive/15 border border-destructive/20 text-destructive text-sm flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                                    <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                                    {errorMsg}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Seu Nome"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reg-email">Email</Label>
                                <Input
                                    id="reg-email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reg-password">Senha</Label>
                                <Input
                                    id="reg-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isAuthenticating}>
                                {isAuthenticating ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <UserPlus className="h-4 w-4 mr-2" />
                                )}
                                Criar conta
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
