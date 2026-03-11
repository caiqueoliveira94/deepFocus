"use client"

import React, { useMemo, useState } from "react"
import { usePomodoro } from "@/hooks/use-pomodoro"
import { useAuth } from "@/hooks/use-auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts"
import {
  Clock,
  Target,
  Briefcase,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Activity,
  History,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from "lucide-react"
import { 
  format, 
  subDays, 
  subMonths, 
  subYears, 
  parseISO, 
  startOfMonth, 
  isSameMonth, 
  isSameDay,
  eachMonthOfInterval,
  eachDayOfInterval,
  startOfYear,
  endOfYear
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Helper to format duration
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const COLORS = ["var(--accent)", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
const ITEMS_PER_PAGE = 8

type TimeRange = "7d" | "30d" | "12m"

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { tasks, projects, isLoading, deleteTask, clearAllTasks } = usePomodoro()

  if (isAuthLoading) {
    return null
  }

  if (!user) {
    redirect("/")
    return null
  }

  // States for filters and pagination
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [timeRange, setTimeRange] = useState<TimeRange>("7d")
  const [sessionsPage, setSessionsPage] = useState(1)
  const [aggregatedPage, setAggregatedPage] = useState(1)

  // Filter tasks based on filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesProject = projectFilter === "all" || task.projectName === projectFilter
      const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesProject && matchesSearch
    })
  }, [tasks, projectFilter, searchQuery])

  // Statistics calculations
  const stats = useMemo(() => {
    const totalSeconds = filteredTasks.reduce((acc, task) => acc + task.duration, 0)
    const completedTasks = filteredTasks.length
    const currentProjects = Array.from(new Set(filteredTasks.map(t => t.projectName)))
    const uniqueProjects = currentProjects.length

    // Chart data based on timeRange
    let periods: { dateStr: string; label: string; fullDate: string; seconds: number }[] = []
    const now = new Date()

    if (timeRange === "7d" || timeRange === "30d") {
      const daysCount = timeRange === "7d" ? 7 : 30
      periods = Array.from({ length: daysCount }, (_, i) => {
        const date = subDays(now, i)
        return {
          dateStr: format(date, "yyyy-MM-dd"),
          label: daysCount > 10 ? format(date, "dd") : format(date, "EEE", { locale: ptBR }),
          fullDate: format(date, "dd/MM", { locale: ptBR }),
          seconds: 0
        }
      }).reverse()

      filteredTasks.forEach(task => {
        const taskDate = format(parseISO(task.completedAt), "yyyy-MM-dd")
        const period = periods.find(p => p.dateStr === taskDate)
        if (period) period.seconds += task.duration
      })
    } else if (timeRange === "12m") {
      periods = Array.from({ length: 12 }, (_, i) => {
        const date = subMonths(now, i)
        return {
          dateStr: format(date, "yyyy-MM"),
          label: format(date, "MMM", { locale: ptBR }),
          fullDate: format(date, "MMMM yyyy", { locale: ptBR }),
          seconds: 0
        }
      }).reverse()

      filteredTasks.forEach(task => {
        const taskMonth = format(parseISO(task.completedAt), "yyyy-MM")
        const period = periods.find(p => p.dateStr === taskMonth)
        if (period) period.seconds += task.duration
      })
    }

    const chartData = periods.map(d => ({
      ...d,
      hours: parseFloat((d.seconds / 3600).toFixed(1)),
      displayTime: formatDuration(d.seconds)
    }))

    // Projects breakdown
    const projectsData = currentProjects.map((proj, index) => {
      const projectSeconds = filteredTasks
        .filter(t => t.projectName === proj)
        .reduce((acc, t) => acc + t.duration, 0)

      return {
        name: proj,
        value: projectSeconds,
        hours: parseFloat((projectSeconds / 3600).toFixed(1)),
        displayTime: formatDuration(projectSeconds),
        color: index === 0 ? "var(--accent)" : COLORS[index % COLORS.length]
      }
    }).filter(p => p.value > 0).sort((a, b) => b.value - a.value)

    // Tasks breakdown (aggregated by name)
    const tasksMap = new Map<string, { duration: number, project: string }>()
    filteredTasks.forEach(task => {
      const key = `${task.name}|${task.projectName}`
      const existing = tasksMap.get(key)
      if (existing) {
        existing.duration += task.duration
      } else {
        tasksMap.set(key, { duration: task.duration, project: task.projectName })
      }
    })

    const aggregatedTasks = Array.from(tasksMap.entries()).map(([key, data]) => {
      const [name] = key.split('|')
      return {
        name,
        projectName: data.project,
        totalSeconds: data.duration,
        displayTime: formatDuration(data.duration)
      }
    }).sort((a, b) => b.totalSeconds - a.totalSeconds)

    return {
      totalTime: formatDuration(totalSeconds),
      totalSeconds,
      completedTasks,
      uniqueProjects,
      chartData,
      projectsData,
      aggregatedTasks
    }
  }, [tasks, projects, timeRange, projectFilter, searchQuery])

  // Pagination Logic
  const paginatedSessions = useMemo(() => {
    const start = (sessionsPage - 1) * ITEMS_PER_PAGE
    return filteredTasks.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredTasks, sessionsPage])

  const filteredAggregated = useMemo(() => {
    return stats.aggregatedTasks.filter(t =>
      (projectFilter === "all" || t.projectName === projectFilter) &&
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [stats.aggregatedTasks, projectFilter, searchQuery])

  const paginatedAggregated = useMemo(() => {
    const start = (aggregatedPage - 1) * ITEMS_PER_PAGE
    return filteredAggregated.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredAggregated, aggregatedPage])

  const totalSessionsPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE)
  const totalAggregatedPages = Math.ceil(filteredAggregated.length / ITEMS_PER_PAGE)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="font-semibold text-sm mb-1">{payload[0].payload.fullDate || label}</p>
          <p className="text-accent font-medium text-xs">
            {payload[0].payload.displayTime || formatDuration(payload[0].value * 3600)}
          </p>
        </div>
      )
    }
    return null
  }



  return (
    <div className="min-h-screen bg-background">
      <Header showBack title="Dashboard" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border/50 hover:border-accent/30 transition-all hover:translate-y-[-2px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Tempo Total
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{stats.totalTime}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Soma de todos os ciclos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 hover:border-accent/30 transition-all hover:translate-y-[-2px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Sessões Concluídas
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Target className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">Histórico completo</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 hover:border-accent/30 transition-all hover:translate-y-[-2px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Projetos Ativos
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Briefcase className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{stats.uniqueProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">Categorias registradas</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 hover:border-accent/30 transition-all hover:translate-y-[-2px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Foco Diário (Méd.)
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {formatDuration(stats.totalSeconds / Math.max(1, stats.chartData.filter(d => d.seconds > 0).length))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Média por dia ativo</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="lg:col-span-2 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  Atividade de Foco
                  <Select value={timeRange} onValueChange={(val: TimeRange) => setTimeRange(val)}>
                    <SelectTrigger className="h-7 w-[130px] bg-accent/10 border-accent/20 text-accent font-medium text-xs">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d" className="text-xs">Últimos 7 dias</SelectItem>
                      <SelectItem value="30d" className="text-xs">Últimos 30 dias</SelectItem>
                      <SelectItem value="12m" className="text-xs">Últimos 12 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
                <CardDescription>
                  {timeRange === "12m" ? "Horas dedicadas ao trabalho por mês." : "Horas dedicadas ao trabalho profundo por dia."}
                </CardDescription>
              </div>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="h-[300px] pl-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#888888", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#888888", fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#88888810" }} />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {stats.chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === stats.chartData.length - 1 ? "var(--accent)" : "color-mix(in oklch, var(--accent), transparent 70%)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Distribuição por Projeto</CardTitle>
              <CardDescription>Tempo gasto em cada categoria.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.projectsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.projectsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 max-h-[140px] overflow-y-auto px-1 custom-scrollbar text-sm">
                {stats.projectsData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium truncate max-w-[120px]">{item.name}</span>
                    </div>
                    <span className="text-muted-foreground tabular-nums">{item.displayTime}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and History Section */}
        <div className="space-y-6">
          <Tabs defaultValue="sessions" className="w-full">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-2">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <History className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-foreground whitespace-nowrap">
                    Histórico completo
                  </h3>
                </div>
                <TabsList className="bg-card border h-10 p-1">
                  <TabsTrigger value="sessions" className="text-xs px-4">Sessões</TabsTrigger>
                  <TabsTrigger value="aggregated" className="text-xs px-4">Total por Tarefa</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Procurar tarefa..."
                    className="pl-10 h-10 bg-card border-border"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setSessionsPage(1)
                      setAggregatedPage(1)
                    }}
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-fit">
                  <Select value={projectFilter} onValueChange={(val) => {
                    setProjectFilter(val)
                    setSessionsPage(1)
                    setAggregatedPage(1)
                  }}>
                    <SelectTrigger className="w-full sm:w-[160px] h-10 bg-card">
                      <SelectValue placeholder="Projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos Projetos</SelectItem>
                      {projects.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" title="Limpar tudo">
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação irá excluir permanentemente todas as suas sessões registradas do seu histórico de produtividade. Esta mudança não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={clearAllTasks}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                          Limpar Histórico
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>

            <TabsContent value="sessions" className="mt-6 border-none p-0 focus-visible:ring-0">
              <Card className="border-border/50 overflow-hidden bg-card/50 p-6">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead>Tarefa</TableHead>
                      <TableHead>Projeto</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Concluído em</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSessions.map((task) => (
                      <TableRow key={task.id} className="border-border/40 hover:bg-muted/30">
                        <TableCell className="font-medium">{task.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal border-accent/20 bg-accent/5 text-accent text-[10px]">
                            {task.projectName}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{formatDuration(task.duration)}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{formatDate(task.completedAt)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedSessions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          Nenhuma sessão encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
              <Pagination
                currentPage={sessionsPage}
                totalPages={totalSessionsPages}
                onPageChange={setSessionsPage}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="aggregated" className="mt-6 border-none p-0 focus-visible:ring-0">
              <Card className="border-border/50 overflow-hidden bg-card/50 p-6">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead>Tarefa</TableHead>
                      <TableHead>Projeto</TableHead>
                      <TableHead>Tempo Total</TableHead>
                      <TableHead>Sessões</TableHead>
                      <TableHead className="w-[150px]">Relevância</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAggregated.map((task, idx) => (
                      <TableRow key={`${task.name}-${idx}`} className="border-border/40 hover:bg-muted/30">
                        <TableCell className="font-medium">{task.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal border-accent/20 bg-accent/5 text-accent text-[10px]">
                            {task.projectName}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-accent">{task.displayTime}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {tasks.filter(t => t.name === task.name && t.projectName === task.projectName).length} sessões
                        </TableCell>
                        <TableCell>
                          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-accent"
                              style={{ width: `${(task.totalSeconds / Math.max(1, stats.totalSeconds)) * 100}%` }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedAggregated.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          Nenhuma tarefa agregada encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
              <Pagination
                currentPage={aggregatedPage}
                totalPages={totalAggregatedPages}
                onPageChange={setAggregatedPage}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>
    </div>
  )
}
