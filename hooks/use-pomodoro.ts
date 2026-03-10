"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"

export interface Task {
  id: string
  name: string
  projectName: string
  duration: number
  completedAt: string
}

const STORAGE_KEY = "pomodoro-tasks"
const PROJECTS_KEY = "pomodoro-projects"

export function usePomodoro(defaultMinutes: number = 25) {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [taskName, setTaskName] = useState("")
  const [projectName, setProjectName] = useState("")
  const [timeLeft, setTimeLeft] = useState(defaultMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<string[]>([])
  const [isSessionComplete, setIsSessionComplete] = useState(false)
  const [expectedEndTime, setExpectedEndTime] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const startTimeRef = useRef<number | null>(null)
  const elapsedRef = useRef<number>(0)

  const getStorageKeys = useCallback(() => {
    if (user) {
      return {
        tasks: `pomodoro-tasks-${user.id}`,
        projects: `pomodoro-projects-${user.id}`
      }
    }
    return {
      tasks: "pomodoro-tasks",
      projects: "pomodoro-projects"
    }
  }, [user])

  const load = useCallback(async (isInitial = false) => {
    if (isAuthLoading) return

    if (isInitial) setIsLoading(true)

    const currentUserId = user?.id || 'guest'
    const lastUserId = typeof window !== 'undefined' ? localStorage.getItem('last-user-id') : null

    if (lastUserId !== currentUserId) {
      setTasks([])
      setProjects([])
      if (typeof window !== 'undefined') {
        localStorage.setItem('last-user-id', currentUserId)
      }
    }

    if (user) {
      const { data: dbTasks, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .order('completed_at', { ascending: false })

      const { data: dbProjects, error: projError } = await supabase
        .from('projects')
        .select('name')

      if (!taskError && dbTasks) {
        setTasks(dbTasks.map(t => ({
          id: t.id,
          name: t.name,
          projectName: t.project_name,
          duration: t.duration,
          completedAt: t.completed_at
        })))
      }

      if (!projError && dbProjects) {
        setProjects(Array.from(new Set(dbProjects.map(p => p.name))))
      }
    } else {
      const keys = getStorageKeys()
      const savedTasks = localStorage.getItem(keys.tasks)
      const savedProjects = localStorage.getItem(keys.projects)

      setTasks(savedTasks ? JSON.parse(savedTasks) : [])
      setProjects(savedProjects ? JSON.parse(savedProjects) : [])
    }
    setIsLoading(false)
  }, [user, isAuthLoading, getStorageKeys])

  useEffect(() => {
    load(true)
  }, [load])

  useEffect(() => {
    if (user) return
    const keys = getStorageKeys()
    localStorage.setItem(keys.tasks, JSON.stringify(tasks))
    localStorage.setItem(keys.projects, JSON.stringify(projects))
  }, [tasks, projects, user, getStorageKeys])

  const notifyCompletion = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime)
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1)
      oscillator.start(audioCtx.currentTime)
      oscillator.stop(audioCtx.currentTime + 1)
    } catch (e) {
      console.warn("Audio Context not available", e)
    }

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Tempo esgotado!", {
        body: `A sessão para "${taskName}" terminou.`,
        icon: "/icon.png"
      })
    }
  }, [taskName])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && expectedEndTime) {
      interval = setInterval(() => {
        const now = Date.now()
        const remaining = Math.max(0, Math.ceil((expectedEndTime - now) / 1000))

        if (remaining !== timeLeft) {
          setTimeLeft(remaining)
        }

        if (remaining <= 0) {
          setIsRunning(false)
          setExpectedEndTime(null)
          setIsSessionComplete(true)
          notifyCompletion()
        }
      }, 100)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, expectedEndTime, timeLeft, notifyCompletion])

  useEffect(() => {
    if (isSessionComplete) {
      const originalTitle = document.title
      const interval = setInterval(() => {
        document.title = document.title === "🔔 TEMPO ESGOTADO!" ? originalTitle : "🔔 TEMPO ESGOTADO!"
      }, 1000)
      return () => {
        clearInterval(interval)
        document.title = originalTitle
      }
    }
  }, [isSessionComplete])

  useEffect(() => {
    if (isRunning && !startTimeRef.current) {
      startTimeRef.current = Date.now()
    } else if (!isRunning && startTimeRef.current) {
      elapsedRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000)
      startTimeRef.current = null
    }
  }, [isRunning])

  const start = useCallback(() => {
    if (taskName.trim() && projectName.trim()) {
      setExpectedEndTime(Date.now() + timeLeft * 1000)
      setIsRunning(true)
    }
  }, [taskName, projectName, timeLeft])

  const pause = useCallback(() => {
    setIsRunning(false)
    setExpectedEndTime(null)
  }, [])

  const reset = useCallback(() => {
    setIsRunning(false)
    setExpectedEndTime(null)
    setTimeLeft(defaultMinutes * 60)
    startTimeRef.current = null
    elapsedRef.current = 0
  }, [defaultMinutes])

  const complete = useCallback(async () => {
    if (!taskName.trim() || !projectName.trim()) return

    setIsLoading(true)
    try {
      let totalElapsed = elapsedRef.current
      if (startTimeRef.current) {
        totalElapsed += Math.floor((Date.now() - startTimeRef.current) / 1000)
      }

      const newTaskData = {
        name: taskName,
        projectName: projectName.trim(),
        duration: totalElapsed,
        completedAt: new Date().toISOString(),
      }

      if (user) {
        const { data: insertedTask, error: taskError } = await supabase
          .from('tasks')
          .insert({
            user_id: user.id,
            name: newTaskData.name,
            project_name: newTaskData.projectName,
            duration: newTaskData.duration,
            completed_at: newTaskData.completedAt
          })
          .select()
          .single()

        if (!taskError && insertedTask) {
          setTasks(prev => [{
            id: insertedTask.id,
            name: insertedTask.name,
            projectName: insertedTask.project_name,
            duration: insertedTask.duration,
            completedAt: insertedTask.completed_at
          }, ...prev])
        }

        await supabase.from('projects').upsert({
          user_id: user.id,
          name: newTaskData.projectName
        }, { onConflict: 'user_id, name' })

        setProjects(prev => {
          if (prev.includes(newTaskData.projectName)) return prev
          return [...prev, newTaskData.projectName]
        })

      } else {
        const newTask: Task = {
          id: Date.now().toString(),
          ...newTaskData
        }
        setTasks((prev) => [newTask, ...prev])
        setProjects((prev) => {
          if (prev.includes(newTaskData.projectName)) return prev
          return [...prev, newTaskData.projectName]
        })
      }

      setTaskName("")
      setProjectName("")
      setIsSessionComplete(false)
      reset()
    } finally {
      setIsLoading(false)
    }
  }, [taskName, projectName, user, reset])

  const discardSession = useCallback(() => {
    setIsSessionComplete(false)
    setTaskName("")
    setProjectName("")
    reset()
  }, [reset])

  const deleteTask = useCallback(async (id: string) => {
    if (user) {
      await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id)
    }
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [user])

  const clearAllTasks = useCallback(async () => {
    if (user) {
      await supabase.from('tasks').delete().eq('user_id', user.id)
    }
    setTasks([])
  }, [user])

  const deleteProject = useCallback(async (name: string) => {
    if (user) {
      await supabase
        .from('projects')
        .delete()
        .eq('name', name)
        .eq('user_id', user.id)
    }

    setProjects((prev) => prev.filter((p) => p !== name))

    if (projectName === name) {
      setProjectName("")
    }
  }, [user, projectName])

  return {
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
    setIsSessionComplete,
    discardSession,
    isLoading,
  }
}
