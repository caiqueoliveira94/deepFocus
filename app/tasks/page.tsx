"use client"

import { useState, useMemo } from "react"
import { TaskList } from "@/components/task-list"
import { usePomodoro } from "@/hooks/use-pomodoro"
import { Header } from "@/components/header"
import { Pagination } from "@/components/pagination"
import { useAuth } from "@/hooks/use-auth"
import { redirect } from "next/navigation"

const TASKS_PER_PAGE = 8

export default function TasksPage() {
    const { tasks, deleteTask, clearAllTasks, isLoading } = usePomodoro()
    const [currentPage, setCurrentPage] = useState(1)
    const { user } = useAuth()

    if (!user) {
        redirect("/")
    }

    const totalPages = Math.ceil(tasks.length / TASKS_PER_PAGE)

    const currentTasks = useMemo(() => {
        const startIdx = (currentPage - 1) * TASKS_PER_PAGE
        return tasks.slice(startIdx, startIdx + TASKS_PER_PAGE)
    }, [tasks, currentPage])

    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages)
    }

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <div className="sticky top-0 z-50">
                <Header showBack title="Histórico" />
            </div>

            <div className="max-w-xl mx-auto w-full px-6 py-12 flex-1 flex flex-col">
                <section className="flex-1">
                    <TaskList
                        tasks={currentTasks}
                        onDelete={deleteTask}
                        onClearAll={clearAllTasks}
                        title="Todas as Tarefas"
                        isLoading={isLoading}
                    />
                </section>

                {!isLoading && tasks.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </main>
    )
}
