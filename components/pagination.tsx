"use client"

import { Button } from "./ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    isLoading?: boolean
}

export function Pagination({ currentPage, totalPages, onPageChange, isLoading }: PaginationProps) {
    if (totalPages <= 1) return null

    // Gera array de páginas para mostrar (ex: 1, 2, 3...)
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    // Lógica simples para não mostrar MUITAS páginas se o histórico for gigante
    // Mostra as 5 páginas ao redor da atual
    const visiblePages = pages.filter(p => {
        if (totalPages <= 7) return true
        return Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages
    })

    return (
        <div className="flex items-center justify-center gap-2 py-8">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="h-9 w-9"
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Anterior</span>
            </Button>

            <div className="flex items-center gap-1">
                {visiblePages.map((page, index) => {
                    // Adiciona reticências se houver saltos
                    const prevPage = visiblePages[index - 1]
                    const showEllipsis = prevPage && page - prevPage > 1

                    return (
                        <div key={page} className="flex items-center gap-1">
                            {showEllipsis && <span className="px-2 text-muted-foreground">...</span>}
                            <Button
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => onPageChange(page)}
                                disabled={isLoading}
                                className={`h-9 w-9 p-0 font-medium ${currentPage === page ? 'pointer-events-none' : ''}`}
                            >
                                {page}
                            </Button>
                        </div>
                    )
                })}
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="h-9 w-9"
            >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Próxima</span>
            </Button>
        </div>
    )
}
