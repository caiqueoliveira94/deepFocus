"use client"

import { Play, Pause, RotateCcw, Check, History, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TimerDisplay } from "@/components/timer-display"
import { TaskList } from "@/components/task-list"
import { useAuth } from "@/hooks/use-auth"
import { usePomodoro } from "@/hooks/use-pomodoro"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { ProjectSelect } from "@/components/project-select"
import { Header } from "@/components/header"
import Link from "next/link"
import { useEffect } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function PomodoroPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const {
    taskName,
    setTaskName,
    projectName,
    setProjectName,
    projects,
    timeLeft,
    isRunning,
    tasks,
    start,
    pause,
    reset,
    complete,
    deleteTask,
    clearAllTasks,
    setTimeLeft,
    deleteProject,
    isSessionComplete,
    discardSession,
    isLoading,
  } = usePomodoro(25)

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  const canStart = taskName.trim().length > 0 && projectName.trim().length > 0

  const historyContent = (
    <div className="space-y-4 pb-8">
      <TaskList
        tasks={tasks.slice(0, 7)}
        onDelete={deleteTask}
        onClearAll={clearAllTasks}
        title="Sessões Recentes"
        isLoading={isLoading}
      />
      {tasks.length > 7 && (
        <div className="flex justify-center pt-2">
          <Link href="/tasks">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-black font-medium transition-colors">
              Ver histórico completo ({tasks.length})
            </Button>
          </Link>
        </div>
      )}
    </div>
  )

  return (
    <main className="h-screen bg-background overflow-hidden flex flex-col">
      <Header />

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row gap-8 lg:gap-12 overflow-hidden">

        {/* Coluna 1: Timer e Forms */}
        <section className="flex-1 flex flex-col justify-center py-8 max-w-xl mx-auto w-full overflow-y-auto pr-2 custom-scrollbar">
          <div className="mb-12">
            <TimerDisplay timeLeft={timeLeft} />
          </div>

          {!user && !isAuthLoading && (
            <div className="mb-8">
              <Alert className="bg-muted/30 border-muted">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Você não está logado. Suas tarefas serão salvas localmente.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="flex justify-center gap-2 mb-8">
            {[1, 35, 45].map((mins) => (
              <Button
                key={mins}
                variant={timeLeft === mins * 60 ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeLeft(mins * 60)}
                disabled={isRunning}
                className="w-20"
              >
                {mins}m
              </Button>
            ))}
          </div>

          <div className="mb-8 space-y-3">
            <ProjectSelect
              projects={projects}
              value={projectName}
              onChange={setProjectName}
              onDelete={deleteProject}
              disabled={isRunning}
            />
            <Input
              type="text"
              placeholder="Nome da tarefa..."
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              disabled={isRunning}
              className="text-center text-lg h-14 bg-card border-border focus:border-foreground transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter" && canStart && !isRunning) {
                  start()
                }
              }}
            />
          </div>

          <div className="flex items-center justify-center gap-3">
            {!isRunning ? (
              <Button
                size="lg"
                onClick={start}
                disabled={!canStart}
                className="h-14 px-8 text-base font-medium"
              >
                <Play className="h-5 w-5 mr-2" />
                Iniciar
              </Button>
            ) : (
              <Button
                size="lg"
                variant="secondary"
                onClick={pause}
                className="h-14 px-8 text-base font-medium"
              >
                <Pause className="h-5 w-5 mr-2" />
                Pausar
              </Button>
            )}

            <Button
              size="lg"
              variant="outline"
              onClick={reset}
              className="h-14 px-6"
            >
              <RotateCcw className="h-5 w-5" />
              <span className="sr-only">Reiniciar</span>
            </Button>

            {taskName && (
              <Button
                size="lg"
                variant="outline"
                onClick={complete}
                className="h-14 px-6 text-accent hover:text-white hover:border-accent"
              >
                <Check className="h-5 w-5" />
                <span className="sr-only">Concluir</span>
              </Button>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-6 md:hidden"
                >
                  <History className="h-5 w-5 text-muted-foreground" />
                  <span className="sr-only">Histórico</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85%] sm:max-w-sm border-l border-border/50 p-6 flex flex-col">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-left text-xl font-bold tracking-tight">
                    Sessões <span className="text-accent">Recentes</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {historyContent}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </section>

        <section className="hidden md:flex w-[400px] flex-col h-full overflow-hidden border-l border-border/50 pt-8 pl-8">
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {historyContent}
          </div>
        </section>

        <AlertDialog open={isSessionComplete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sessão Finalizada!</AlertDialogTitle>
              <AlertDialogDescription>
                Você concluiu o tempo planejado para <strong>{taskName}</strong> no projeto <strong>{projectName}</strong>.
                Deseja salvar esta tarefa no seu histórico?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={discardSession}>Descartar</AlertDialogCancel>
              <AlertDialogAction onClick={complete} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Tarefa"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  )
}
