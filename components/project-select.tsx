"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface ProjectSelectProps {
    projects: string[]
    value: string
    onChange: (value: string) => void
    onDelete?: (value: string) => void
    disabled?: boolean
}

export function ProjectSelect({ projects, value, onChange, onDelete, disabled }: ProjectSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className="w-full justify-between h-12 bg-card border-border px-4 font-normal"
                >
                    <span className="truncate">
                        {value ? value : "Selecionar projeto..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder="Procurar ou criar projeto..."
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandList className="max-h-[200px]">
                        <CommandEmpty className="p-2">
                            {inputValue ? (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="w-full justify-start text-sm font-normal"
                                    onClick={() => {
                                        onChange(inputValue)
                                        setOpen(false)
                                        setInputValue("")
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Criar "{inputValue}"
                                </Button>
                            ) : (
                                <p className="text-xs text-center py-2 text-muted-foreground">
                                    Nenhum projeto encontrado.
                                </p>
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {projects.map((project) => (
                                <CommandItem
                                    key={project}
                                    value={project}
                                    onSelect={(currentValue) => {
                                        // currentValue is Lowercase by default in cmdk
                                        // We should find the original case from our projects list
                                        const originalProject = projects.find(p => p.toLowerCase() === currentValue.toLowerCase()) || currentValue
                                        onChange(originalProject)
                                        setOpen(false)
                                    }}
                                    className="flex items-center justify-between group"
                                >
                                    <div className="flex items-center">
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === project ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {project}
                                    </div>
                                    {onDelete && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-30 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                e.preventDefault()
                                                onDelete(project)
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            <span className="sr-only">Excluir {project}</span>
                                        </Button>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
