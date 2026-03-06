"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Task } from "@/hooks/use-pomodoro"
import { Skeleton } from "@/components/ui/skeleton"

interface TaskListProps {
  tasks: Task[]
  onDelete: (id: string) => void
  onClearAll: () => void
  title?: string
  isLoading?: boolean
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${mins}m ${secs}s`
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`
  }
  return `${secs}s`
}

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function TaskList({ tasks, onDelete, onClearAll, title = "Histórico", isLoading }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-card rounded-lg border border-border flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (tasks.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-sm">
          Nenhuma tarefa registrada ainda
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          Limpar tudo
        </Button>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="group flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-accent/40 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground truncate">{task.name}</p>
                <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-medium text-secondary-foreground uppercase tracking-tight">
                  {task.projectName}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm font-mono text-accent">
                  {formatDuration(task.duration)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(task.completedAt)}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(task.id)}
              className="opacity-30 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Excluir tarefa</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
